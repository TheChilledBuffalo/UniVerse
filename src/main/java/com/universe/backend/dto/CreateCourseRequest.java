package com.universe.backend.dto;

import com.universe.backend.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCourseRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String courseCode;

    private String description;

    @NotNull
    private Long teacherId;

    private Integer maxStudents;
}
