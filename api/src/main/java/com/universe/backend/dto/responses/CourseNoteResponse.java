package com.universe.backend.dto.responses;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseNoteResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private String fileUrl;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
