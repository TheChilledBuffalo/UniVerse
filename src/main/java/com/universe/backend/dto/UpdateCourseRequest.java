package com.universe.backend.dto;

import lombok.Data;

@Data
public class UpdateCourseRequest {

    private String name;
    private String courseCode;
    private String description;
    private Long teacherId;
    private Integer maxStudents;
}