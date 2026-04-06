package com.universe.backend.dto.responses;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssignmentSubmissionResponse {

    private Long id;
    private Long courseId;
    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private String submissionNote;
    private String fileUrl;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private Double gradeScore;
    private String gradeFeedback;
    private Long gradedById;
    private String gradedByName;
    private LocalDateTime gradedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
