package com.universe.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public String generateReply(String question, List<String> threadContext) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("Gemini API Key is missing");
        }

        try {
            String prompt = buildPrompt(question, threadContext);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload: {"contents": [{"parts": [{"text": prompt }]}]}
            Map<String, Object> payload = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_URL + apiKey, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode textNode = rootNode.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text");
                return textNode.asText();
            } else {
                log.error("Failed to generate AI reply. Status: {}", response.getStatusCode());
                return "I'm sorry, I couldn't process this request right now.";
            }

        } catch (Exception e) {
            log.error("Error communicating with Gemini API", e);
            return "I'm sorry, I encountered an error while trying to answer.";
        }
    }

    private String buildPrompt(String question, List<String> threadContext) {
        if (threadContext == null || threadContext.isEmpty()) {
            return question;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Context:\n");
        for (String msg : threadContext) {
            sb.append(msg).append("\n");
        }
        sb.append("\nQuestion: ").append(question);
        return sb.toString();
    }
}
