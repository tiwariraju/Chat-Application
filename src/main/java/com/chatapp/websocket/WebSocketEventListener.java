package com.chatapp.websocket;

import com.chatapp.dto.ChatMessage;
import com.chatapp.model.MessageType;
import com.chatapp.service.PresenceService;
import java.security.Principal;
import java.time.Instant;
import java.util.Map;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final PresenceService presenceService;
    private final SimpMessageSendingOperations messagingTemplate;

    public WebSocketEventListener(PresenceService presenceService, SimpMessageSendingOperations messagingTemplate) {
        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        String sessionId = accessor.getSessionId();

        if (principal != null && sessionId != null) {
            presenceService.addUserSession(sessionId, principal.getName());

            ChatMessage joinMessage = new ChatMessage();
            joinMessage.setType(MessageType.JOIN);
            joinMessage.setSender(principal.getName());
            joinMessage.setContent(principal.getName() + " joined the chat");
            joinMessage.setTimestamp(Instant.now());

            messagingTemplate.convertAndSend("/topic/public", joinMessage);
            messagingTemplate.convertAndSend("/topic/users", Map.of("users", presenceService.getActiveUsers()));
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String username = presenceService.removeUserSession(sessionId);

        if (username != null) {
            ChatMessage leaveMessage = new ChatMessage();
            leaveMessage.setType(MessageType.LEAVE);
            leaveMessage.setSender(username);
            leaveMessage.setContent(username + " left the chat");
            leaveMessage.setTimestamp(Instant.now());

            messagingTemplate.convertAndSend("/topic/public", leaveMessage);
            messagingTemplate.convertAndSend("/topic/users", Map.of("users", presenceService.getActiveUsers()));
        }
    }
}
