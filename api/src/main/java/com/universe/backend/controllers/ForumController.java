package com.universe.backend.controllers;

import com.universe.backend.dto.ForumPostRequest;
import com.universe.backend.dto.ForumPostResponse;
import com.universe.backend.dto.ForumReplyRequest;
import com.universe.backend.dto.ForumReplyResponse;
import com.universe.backend.entity.ForumPost;
import com.universe.backend.entity.ForumReply;
import com.universe.backend.service.ForumService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/forum/posts")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @PostMapping
    public ResponseEntity<ForumPostResponse> createPost(
            @Valid @RequestBody ForumPostRequest request, Principal principal) {
        String email = principal.getName();
        ForumPost post = forumService.createPost(request, email);
        return ResponseEntity.ok(mapToPostResponse(post));
    }

    @GetMapping
    public ResponseEntity<List<ForumPostResponse>> getAllPosts() {
        List<ForumPost> posts = forumService.getAllPosts();
        List<ForumPostResponse> responses =
                posts.stream().map(this::mapToPostResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ForumPostResponse> getPost(@PathVariable Long id) {
        ForumPost post = forumService.getPost(id);
        return ResponseEntity.ok(mapToPostResponse(post));
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<ForumReplyResponse> addReply(
            @PathVariable Long id, @Valid @RequestBody ForumReplyRequest request, Principal principal) {
        String email = principal.getName();
        ForumReply reply = forumService.addReply(id, request, email);
        return ResponseEntity.ok(mapToReplyResponse(reply));
    }

    private ForumPostResponse mapToPostResponse(ForumPost post) {
        List<ForumReplyResponse> replyResponses =
                post.getReplies().stream().map(this::mapToReplyResponse).collect(Collectors.toList());

        return ForumPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorName(post.getAuthor().getName())
                .authorId(String.valueOf(post.getAuthor().getId()))
                .createdAt(post.getCreatedAt())
                .replies(replyResponses)
                .build();
    }

    private ForumReplyResponse mapToReplyResponse(ForumReply reply) {
        return ForumReplyResponse.builder()
                .id(reply.getId())
                .content(reply.getContent())
                .authorName(reply.getAuthor().getName())
                .authorId(reply.getAuthor().getId())
                .isAiResponse(reply.getIsAiResponse())
                .createdAt(reply.getCreatedAt())
                .build();
    }
}
