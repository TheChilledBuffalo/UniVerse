package com.universe.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private String postedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
