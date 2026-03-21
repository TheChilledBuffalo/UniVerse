package com.universe.backend.dto.responses;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {

    @NotNull
    private Long id;

    @NotNull
    private String name;

    @NotNull
    private String courseCode;

    private String description;

    @NotNull
    private String teacherName;

    @NotNull
    private Integer maxStudents;
}
