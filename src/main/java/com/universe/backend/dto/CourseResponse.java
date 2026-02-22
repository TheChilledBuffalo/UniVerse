package com.universe.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {

    private Long id;
    private String name;
    private String courseCode;
    private String description;
    private String teacherName;
    private Integer maxStudents;
}
