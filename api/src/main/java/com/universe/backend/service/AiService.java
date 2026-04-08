package com.universe.backend.service;

import java.util.List;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AiService {

    private static final String FALLBACK_GENERIC = "I'm sorry, I encountered an error while trying to answer.";
    private static final String FALLBACK_QUOTA =
            "AI is temporarily unavailable due to API quota limits. Please try again in a minute.";

    private static final String SYSTEM_INSTRUCTION =
            "You are a helpful assistant participating directly in a course chat. "
                    + "Read the provided chat context to understand the flow, but ONLY answer the 'Latest user question'. "
                    + "CRITICAL RULES: "
                    + "1. Provide ONLY the direct answer to the question. "
                    + "2. DO NOT output your internal reasoning, thought process, or analysis of the context. "
                    + "3. DO NOT summarize the context, repeat the question, or explain what the user is asking. "
                    + "4. DO NOT use meta-phrases like 'Based on the context...' or 'Here is the answer...'. "
                    + "5. Act exactly as a human participant in a chat room giving a direct reply.";

    private final ChatClient chatClient;

    public AiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public AiReplyResult generateReply(String question, List<String> threadContext) {
        try {
            String promptText = buildPrompt(question, threadContext);

            String content = chatClient
                    .prompt()
                    .system(SYSTEM_INSTRUCTION)
                    .user(promptText)
                    .call()
                    .content();
            if (content == null || content.isBlank()) {
                return new AiReplyResult(FALLBACK_GENERIC, true, "empty_response");
            }

            return new AiReplyResult(content, false, null);

        } catch (Exception e) {
            String rootMessage = getRootCauseMessage(e);
            String normalized = rootMessage.toLowerCase(Locale.ROOT);

            if (normalized.contains("quota exceeded")
                    || normalized.contains("429")
                    || normalized.contains("rate limit")) {
                log.warn("AI provider quota/rate-limited: {}", rootMessage);
                return new AiReplyResult(FALLBACK_QUOTA, true, "quota_exceeded");
            }

            log.error("Error communicating with Gemini API via Spring AI", e);
            return new AiReplyResult(FALLBACK_GENERIC, true, "provider_error");
        }
    }

    private String getRootCauseMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null) {
            current = current.getCause();
        }

        String message = current.getMessage();
        return message == null ? current.getClass().getSimpleName() : message;
    }

    private String buildPrompt(String question, List<String> threadContext) {
        StringBuilder sb = new StringBuilder();

        if (threadContext != null && !threadContext.isEmpty()) {
            sb.append("--- CHAT CONTEXT (Oldest to Newest) ---\n");
            for (String msg : threadContext) {
                sb.append(msg).append("\n");
            }
            sb.append("--------------------------------------\n\n");
        }

        sb.append("Latest user question: ");
        sb.append(question == null || question.isBlank() ? "Please help with this topic." : question);

        return sb.toString();
    }

    public record AiReplyResult(String content, boolean fallback, String reason) {}
}
