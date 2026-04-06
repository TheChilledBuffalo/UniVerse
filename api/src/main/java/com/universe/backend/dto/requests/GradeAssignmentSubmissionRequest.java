package com.universe.backend.dto.requests;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeAssignmentSubmissionRequest {

    @NotNull
    private Double gradeScore;

    private String gradeFeedback;
}
