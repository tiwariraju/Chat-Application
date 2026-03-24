package com.chatapp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {

    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    public void addUserSession(String sessionId, String username) {
        if (sessionId != null && username != null) {
            sessionUserMap.put(sessionId, username);
        }
    }

    public String removeUserSession(String sessionId) {
        return sessionUserMap.remove(sessionId);
    }

    public List<String> getActiveUsers() {
        return new ArrayList<>(sessionUserMap.values().stream().distinct().sorted().toList());
    }
}
