package com.universe.backend.dto.responses;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnrollmentResponse {

    @NotNull
    private Long enrollmentId;

    @NotNull
    private Long studentId;

    @NotNull
    private String studentName;

    @NotNull
    private Long courseId;

    @NotNull
    private String courseName;
}
