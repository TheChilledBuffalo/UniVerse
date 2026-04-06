package com.universe.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForumReplyResponse {
    private Long id;
    private String content;
    private String authorName;
    private Long authorId;
    private Boolean isAiResponse;
    private LocalDateTime createdAt;
}
