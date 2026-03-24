package com.chatapp.controller;

import com.chatapp.dto.ChatMessage;
import com.chatapp.model.MessageType;
import com.chatapp.service.PresenceService;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final PresenceService presenceService;

    public ChatController(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage message, Principal principal) {
        message.setType(MessageType.CHAT);
        message.setSender(principal.getName());
        message.setTimestamp(Instant.now());
        return message;
    }

    @GetMapping("/active-users")
    public List<String> activeUsers() {
        return presenceService.getActiveUsers();
    }

    @GetMapping("/health")
    public String health() {
        return "Chat service is running";
    }
}
