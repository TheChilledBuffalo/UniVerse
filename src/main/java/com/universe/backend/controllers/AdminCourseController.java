package com.universe.backend.controllers;

import com.universe.backend.dto.CourseResponse;
import com.universe.backend.dto.CreateCourseRequest;
import com.universe.backend.dto.UpdateCourseRequest;
import com.universe.backend.service.AdminCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminCourseController {

    private final AdminCourseService adminCourseService;

    @PostMapping("/course")
    public CourseResponse createCourse(@RequestBody CreateCourseRequest request) {
        return adminCourseService.createCourse(request);
    }

    @PostMapping("/courses/upload")
    public List<CourseResponse> uploadCourses(@RequestParam MultipartFile file) {
        return adminCourseService.createCourses(file);
    }

    @GetMapping("/courses")
    public List<CourseResponse> getAllCourses() {
        return adminCourseService.getAllCourses();
    }

    @PutMapping("course/{id}")
    public CourseResponse updateCourse(@PathVariable Long id, @RequestBody UpdateCourseRequest request) {
        return adminCourseService.updateCourse(id, request);
    }

    @DeleteMapping("course/{id}")
    public void deleteCourse(@PathVariable Long id) {
        adminCourseService.deleteCourse(id);
    }
}
