package com.universe.backend.service;

import com.universe.backend.dto.responses.CourseNoteResponse;
import com.universe.backend.entity.Course;
import com.universe.backend.entity.CourseNote;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.CourseNoteRepository;
import com.universe.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CourseNoteService {

    private final CourseNoteRepository courseNoteRepository;
    private final CourseService courseService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public CourseNoteResponse createNote(
            Long courseId, Long userId, Role role, String title, String description, MultipartFile file) {

        Course course = courseService.getManageableCourse(courseId, userId, role);
        User createdBy = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        CourseNote note = CourseNote.builder()
                .title(title)
                .description(description)
                .fileUrl(fileStorageService.uploadFile(file))
                .originalFileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .course(course)
                .createdBy(createdBy)
                .build();

        courseNoteRepository.save(note);
        return mapToResponse(note);
    }

    public List<CourseNoteResponse> getAllNotes(Long courseId, Long userId, Role role) {
        Course course = courseService.getAccessibleCourse(courseId, userId, role);

        return courseNoteRepository.findByCourseIdOrderByCreatedAtDesc(course.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CourseNoteResponse getNote(Long courseId, Long noteId, Long userId, Role role) {
        courseService.getAccessibleCourse(courseId, userId, role);
        return mapToResponse(getNoteOrThrow(courseId, noteId));
    }

    public String getNoteDownloadUrl(Long courseId, Long noteId, Long userId, Role role) {
        courseService.getAccessibleCourse(courseId, userId, role);
        CourseNote note = getNoteOrThrow(courseId, noteId);
        return fileStorageService.getPresignedDownloadUrl(note.getFileUrl());
    }

    public CourseNoteResponse updateNote(
            Long courseId, Long noteId, Long userId, Role role, String title, String description, MultipartFile file) {

        courseService.getManageableCourse(courseId, userId, role);
        CourseNote note = getNoteOrThrow(courseId, noteId);

        if (title != null && !title.isBlank()) {
            note.setTitle(title);
        }
        if (description != null) {
            note.setDescription(description);
        }
        if (file != null && !file.isEmpty()) {
            note.setFileUrl(fileStorageService.uploadFile(file));
            note.setOriginalFileName(file.getOriginalFilename());
            note.setContentType(file.getContentType());
            note.setFileSize(file.getSize());
        }

        courseNoteRepository.save(note);
        return mapToResponse(note);
    }

    public void deleteNote(Long courseId, Long noteId, Long userId, Role role) {
        courseService.getManageableCourse(courseId, userId, role);

        CourseNote note = getNoteOrThrow(courseId, noteId);
        courseNoteRepository.delete(note);
    }

    private CourseNote getNoteOrThrow(Long courseId, Long noteId) {
        return courseNoteRepository
                .findByIdAndCourseId(noteId, courseId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }

    private CourseNoteResponse mapToResponse(CourseNote note) {
        return CourseNoteResponse.builder()
                .id(note.getId())
                .courseId(note.getCourse().getId())
                .title(note.getTitle())
                .description(note.getDescription())
                .fileUrl(note.getFileUrl())
                .originalFileName(note.getOriginalFileName())
                .contentType(note.getContentType())
                .fileSize(note.getFileSize())
                .createdById(note.getCreatedBy().getId())
                .createdByName(note.getCreatedBy().getName())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
