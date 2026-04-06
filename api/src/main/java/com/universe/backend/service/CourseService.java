package com.universe.backend.service;

import com.universe.backend.dto.responses.CourseResponse;
import com.universe.backend.dto.responses.UserResponse;
import com.universe.backend.entity.Course;
import com.universe.backend.entity.Enrollment;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.CourseRepository;
import com.universe.backend.repository.EnrollmentRepository;
import com.universe.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public List<CourseResponse> getAllMyCourses(Long id, Role role) {

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        return switch (role) {
            case ADMIN ->
                courseRepository.findAll().stream().map(this::mapToResponse).toList();
            case TEACHER ->
                courseRepository.findByTeacher(user).stream()
                        .map(this::mapToResponse)
                        .toList();
            case STUDENT ->
                enrollmentRepository.findByStudentId(id).stream()
                        .map(Enrollment::getCourse)
                        .map(this::mapToResponse)
                        .toList();
        };
    }

    // TODO: Add assignments, notes, discussion forum
    public CourseResponse getCourseById(Long courseId, Long userId, Role role) {
        Course course = getAccessibleCourse(courseId, userId, role);
        return mapToResponse(course);
    }

    public CourseResponse getCourseByCode(String courseCode, Long userId, Role role) {
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository
                .findByCourseCode(courseCode)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return getCourseResponse(userId, role, course);
    }

    public Course getAccessibleCourse(Long courseId, Long userId, Role role) {
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        getCourseResponse(userId, role, course);
        return course;
    }

    public Course getManageableCourse(Long courseId, Long userId, Role role) {
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));

        if (role == Role.ADMIN) {
            return course;
        }

        if (role == Role.TEACHER && course.getTeacher().getId().equals(userId)) {
            return course;
        }

        throw new RuntimeException("Access denied");
    }

    public List<UserResponse> getCourseStudents(Long courseId, Long userId, Role role) {
        Course course = getManageableCourse(courseId, userId, role);

        return enrollmentRepository.findByCourseId(course.getId()).stream()
                .map(Enrollment::getStudent)
                .map(student -> UserResponse.builder()
                        .id(student.getId())
                        .name(student.getName())
                        .email(student.getEmail())
                        .role(student.getRole().name())
                        .department(
                                student.getDepartment() != null
                                        ? student.getDepartment().name()
                                        : null)
                        .build())
                .toList();
    }

    private CourseResponse mapToResponse(Course course) {

        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .courseCode(course.getCourseCode())
                .description(course.getDescription())
                .teacherName(course.getTeacher().getName())
                .maxStudents(course.getMaxStudents())
                .build();
    }

    private CourseResponse getCourseResponse(Long userId, Role role, Course course) {
        switch (role) {
            case ADMIN -> {
                return mapToResponse(course);
            }
            case TEACHER -> {
                if (!course.getTeacher().getId().equals(userId)) {
                    throw new RuntimeException("Access denied");
                }
            }
            case STUDENT -> {
                if (!enrollmentRepository.existsByStudentIdAndCourseId(userId, course.getId())) {
                    throw new RuntimeException("Access denied");
                }
            }
        }

        return mapToResponse(course);
    }
}
