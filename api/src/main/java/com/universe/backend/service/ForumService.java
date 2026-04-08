package com.universe.backend.service;

import com.universe.backend.dto.requests.ForumMessageRequest;
import com.universe.backend.entity.Course;
import com.universe.backend.entity.ForumMessage;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.ForumMessageRepository;
import com.universe.backend.repository.UserRepository;
import java.util.List;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumMessageRepository forumMessageRepository;
    private final UserRepository userRepository;
    private final AiService aiService;
    private final CourseService courseService;

    @Autowired
    @Lazy
    private ForumService self;

    private static final Pattern AI_TRIGGER_PATTERN = Pattern.compile("(?i)(^|\\s)@ai\\b");

    @Transactional
    public ForumMessage sendMessage(Long courseId, ForumMessageRequest request, Long userId, Role role) {
        User user = getUserById(userId);
        Course course = courseService.getAccessibleCourse(courseId, userId, role);

        ForumMessage message = ForumMessage.builder()
                .content(request.getContent())
                .author(user)
                .course(course)
                .isAiResponse(false)
                .build();

        ForumMessage savedMessage = forumMessageRepository.save(message);

        if (containsAiTrigger(request.getContent())) {
            self.processAiReplyAsync(courseId, request.getContent(), user.getId());
        }

        return savedMessage;
    }

    @Async
    @Transactional
    public void processAiReplyAsync(Long courseId, String triggerContent, Long requesterUserId) {
        try {
            User requester = getUserById(requesterUserId);
            Course course = courseService.getAccessibleCourse(courseId, requesterUserId, requester.getRole());

            String question = extractQuestion(triggerContent);

            List<ForumMessage> recentMessages = forumMessageRepository.findByCourseIdOrderByCreatedAtAsc(courseId);
            int startIndex = Math.max(0, recentMessages.size() - 10);
            List<String> context = new java.util.ArrayList<>();
            context.add("Course: " + course.getName() + " (" + course.getCourseCode() + ")");
            for (ForumMessage msg : recentMessages.subList(startIndex, recentMessages.size())) {
                String name = Boolean.TRUE.equals(msg.getIsAiResponse())
                        ? "UniVerse AI"
                        : msg.getAuthor().getName();
                context.add(name + ": " + msg.getContent());
            }

            AiService.AiReplyResult aiResult = aiService.generateReply(question, context);

            ForumMessage aiReply = ForumMessage.builder()
                    .content(aiResult.content())
                    .course(course)
                    .author(requester)
                    .isAiResponse(true)
                    .build();

            forumMessageRepository.save(aiReply);
            if (aiResult.fallback()) {
                log.warn("Saved fallback AI chat reply for course {} (reason={})", courseId, aiResult.reason());
            } else {
                log.info("Successfully generated and saved AI chat reply for course {}", courseId);
            }

        } catch (Exception e) {
            log.error("Failed to process AI reply asynchronously", e);
        }
    }

    private String extractQuestion(String content) {
        if (content == null) {
            return "Please help with this discussion thread.";
        }

        int index = content.toLowerCase().indexOf("@ai");
        if (index != -1) {
            String question = content.substring(index + 3).trim();
            if (!question.isBlank()) {
                return question;
            }
        }

        return content.isBlank() ? "Please help with this discussion thread." : content;
    }

    private boolean containsAiTrigger(String content) {
        return content != null && AI_TRIGGER_PATTERN.matcher(content).find();
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public List<ForumMessage> getMessages(Long courseId, Long userId, Role role) {
        courseService.getAccessibleCourse(courseId, userId, role);
        return forumMessageRepository.findByCourseIdOrderByCreatedAtAsc(courseId);
    }
}
