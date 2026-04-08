package com.universe.backend.controllers;

import com.universe.backend.dto.requests.ForumMessageRequest;
import com.universe.backend.dto.responses.ForumMessageResponse;
import com.universe.backend.entity.ForumMessage;
import com.universe.backend.entity.User;
import com.universe.backend.service.ForumService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/forum/messages")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;
    private static final String AI_DISPLAY_NAME = "UniVerse AI";

    @PostMapping
    public ResponseEntity<ForumMessageResponse> sendMessage(
            @PathVariable Long courseId,
            @Valid @RequestBody ForumMessageRequest request,
            @AuthenticationPrincipal User user) {
        ForumMessage message = forumService.sendMessage(courseId, request, user.getId(), user.getRole());
        return ResponseEntity.ok(mapToMessageResponse(message));
    }

    @GetMapping
    public ResponseEntity<List<ForumMessageResponse>> getMessages(
            @PathVariable Long courseId, @AuthenticationPrincipal User user) {
        List<ForumMessage> messages = forumService.getMessages(courseId, user.getId(), user.getRole());
        List<ForumMessageResponse> responses =
                messages.stream().map(this::mapToMessageResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private ForumMessageResponse mapToMessageResponse(ForumMessage message) {
        boolean isAiReply = Boolean.TRUE.equals(message.getIsAiResponse());

        return ForumMessageResponse.builder()
                .id(message.getId())
                .courseId(message.getCourse().getId())
                .content(message.getContent())
                .authorName(isAiReply ? AI_DISPLAY_NAME : message.getAuthor().getName())
                .authorId(isAiReply ? null : message.getAuthor().getId())
                .isAiResponse(isAiReply)
                .createdAt(message.getCreatedAt())
                .build();
    }
}
