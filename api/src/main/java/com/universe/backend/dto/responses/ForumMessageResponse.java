package com.universe.backend.dto.responses;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForumMessageResponse {
    private Long id;
    private Long courseId;
    private String content;
    private String authorName;
    private Long authorId;
    private Boolean isAiResponse;
    private LocalDateTime createdAt;
}
