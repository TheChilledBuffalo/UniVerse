package com.universe.backend.service;

import com.universe.backend.dto.responses.CourseAssignmentResponse;
import com.universe.backend.entity.Course;
import com.universe.backend.entity.CourseAssignment;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.CourseAssignmentRepository;
import com.universe.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CourseAssignmentService {

    private final CourseAssignmentRepository courseAssignmentRepository;
    private final CourseService courseService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public CourseAssignmentResponse createAssignment(
            Long courseId,
            Long userId,
            Role role,
            String title,
            String description,
            LocalDateTime dueAt,
            MultipartFile file) {

        Course course = courseService.getManageableCourse(courseId, userId, role);
        User createdBy = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        CourseAssignment assignment = CourseAssignment.builder()
                .title(title)
                .description(description)
                .dueAt(dueAt)
                .fileUrl(fileStorageService.uploadFile(file))
                .originalFileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .course(course)
                .createdBy(createdBy)
                .build();

        courseAssignmentRepository.save(assignment);
        return mapToResponse(assignment);
    }

    public List<CourseAssignmentResponse> getAllAssignments(Long courseId, Long userId, Role role) {
        Course course = courseService.getAccessibleCourse(courseId, userId, role);

        return courseAssignmentRepository.findByCourseIdOrderByCreatedAtDesc(course.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CourseAssignmentResponse getAssignment(Long courseId, Long assignmentId, Long userId, Role role) {
        courseService.getAccessibleCourse(courseId, userId, role);
        return mapToResponse(getAssignmentOrThrow(courseId, assignmentId));
    }

    public String getAssignmentDownloadUrl(Long courseId, Long assignmentId, Long userId, Role role) {
        courseService.getAccessibleCourse(courseId, userId, role);
        CourseAssignment assignment = getAssignmentOrThrow(courseId, assignmentId);
        return fileStorageService.getPresignedDownloadUrl(assignment.getFileUrl());
    }

    public CourseAssignmentResponse updateAssignment(
            Long courseId,
            Long assignmentId,
            Long userId,
            Role role,
            String title,
            String description,
            LocalDateTime dueAt,
            MultipartFile file) {

        courseService.getManageableCourse(courseId, userId, role);
        CourseAssignment assignment = getAssignmentOrThrow(courseId, assignmentId);

        if (title != null && !title.isBlank()) {
            assignment.setTitle(title);
        }
        if (description != null) {
            assignment.setDescription(description);
        }
        if (dueAt != null) {
            assignment.setDueAt(dueAt);
        }
        if (file != null && !file.isEmpty()) {
            assignment.setFileUrl(fileStorageService.uploadFile(file));
            assignment.setOriginalFileName(file.getOriginalFilename());
            assignment.setContentType(file.getContentType());
            assignment.setFileSize(file.getSize());
        }

        courseAssignmentRepository.save(assignment);
        return mapToResponse(assignment);
    }

    public void deleteAssignment(Long courseId, Long assignmentId, Long userId, Role role) {
        courseService.getManageableCourse(courseId, userId, role);

        CourseAssignment assignment = getAssignmentOrThrow(courseId, assignmentId);
        courseAssignmentRepository.delete(assignment);
    }

    private CourseAssignment getAssignmentOrThrow(Long courseId, Long assignmentId) {
        return courseAssignmentRepository
                .findByIdAndCourseId(assignmentId, courseId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    private CourseAssignmentResponse mapToResponse(CourseAssignment assignment) {
        return CourseAssignmentResponse.builder()
                .id(assignment.getId())
                .courseId(assignment.getCourse().getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueAt(assignment.getDueAt())
                .fileUrl(assignment.getFileUrl())
                .originalFileName(assignment.getOriginalFileName())
                .contentType(assignment.getContentType())
                .fileSize(assignment.getFileSize())
                .createdById(assignment.getCreatedBy().getId())
                .createdByName(assignment.getCreatedBy().getName())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }
}
