package com.universe.backend.service;

import com.universe.backend.dto.ForumPostRequest;
import com.universe.backend.dto.ForumReplyRequest;
import com.universe.backend.entity.ForumPost;
import com.universe.backend.entity.ForumReply;
import com.universe.backend.entity.User;
import com.universe.backend.repository.ForumPostRepository;
import com.universe.backend.repository.ForumReplyRepository;
import com.universe.backend.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository forumPostRepository;
    private final ForumReplyRepository forumReplyRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    @Transactional
    public ForumPost createPost(ForumPostRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost post = ForumPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(user)
                .build();

        return forumPostRepository.save(post);
    }

    @Transactional
    public ForumReply addReply(Long postId, ForumReplyRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost post = forumPostRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        ForumReply reply = ForumReply.builder()
                .content(request.getContent())
                .post(post)
                .author(user)
                .isAiResponse(false)
                .build();

        ForumReply savedReply = forumReplyRepository.save(reply);

        // Check for AI trigger
        if (request.getContent() != null && request.getContent().contains("@ai")) {
            processAiReplyAsync(post, request.getContent(), user);
        }

        return savedReply;
    }

    @Async
    @Transactional
    public void processAiReplyAsync(ForumPost post, String triggerContent, User originalAuthor) {
        try {
            // Extract the question after the @ai trigger
            String question = extractQuestion(triggerContent);

            // Fetch last 5 replies for context (Hybrid approach)
            List<ForumReply> recentReplies = forumReplyRepository.findByPostIdOrderByCreatedAtAsc(post.getId());
            int startIndex = Math.max(0, recentReplies.size() - 5);
            List<String> context = recentReplies.subList(startIndex, recentReplies.size()).stream()
                    .map(r -> r.getAuthor().getName() + ": " + r.getContent())
                    .collect(Collectors.toList());

            // Add the original post context
            context.add(0, "Original Post Title: " + post.getTitle());
            context.add(1, post.getAuthor().getName() + ": " + post.getContent());

            // Generate AI response
            String aiAnswer = aiService.generateReply(question, context);

            // Save AI reply
            ForumReply aiReply = ForumReply.builder()
                    .content(aiAnswer)
                    .post(post)
                    .author(originalAuthor) // Tie it to the user who requested it
                    .isAiResponse(true)
                    .build();

            forumReplyRepository.save(aiReply);
            log.info("Successfully generated and saved AI reply for post {}", post.getId());

        } catch (Exception e) {
            log.error("Failed to process AI reply asynchronously", e);
        }
    }

    private String extractQuestion(String content) {
        int index = content.indexOf("@ai");
        if (index != -1) {
            return content.substring(index + 3).trim();
        }
        return content;
    }

    @Transactional(readOnly = true)
    public List<ForumPost> getAllPosts() {
        return forumPostRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ForumPost getPost(Long id) {
        return forumPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
    }
}
