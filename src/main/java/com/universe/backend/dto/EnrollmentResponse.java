package com.universe.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnrollmentResponse {

    private Long enrollmentId;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
}
