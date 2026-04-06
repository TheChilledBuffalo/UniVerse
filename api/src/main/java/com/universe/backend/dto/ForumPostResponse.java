package com.universe.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForumPostResponse {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private String authorId;
    private LocalDateTime createdAt;
    private List<ForumReplyResponse> replies;
}
