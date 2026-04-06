package com.universe.backend.controllers;

import com.universe.backend.dto.requests.GradeAssignmentSubmissionRequest;
import com.universe.backend.dto.responses.AssignmentSubmissionResponse;
import com.universe.backend.dto.responses.CourseAssignmentResponse;
import com.universe.backend.dto.responses.CourseNoteResponse;
import com.universe.backend.dto.responses.CourseResponse;
import com.universe.backend.dto.responses.UserResponse;
import com.universe.backend.entity.User;
import com.universe.backend.service.AssignmentSubmissionService;
import com.universe.backend.service.CourseAssignmentService;
import com.universe.backend.service.CourseNoteService;
import com.universe.backend.service.CourseService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseNoteService courseNoteService;
    private final CourseAssignmentService courseAssignmentService;
    private final AssignmentSubmissionService assignmentSubmissionService;

    @GetMapping
    public List<CourseResponse> getAllMyCourses(@AuthenticationPrincipal User user) {
        return courseService.getAllMyCourses(user.getId(), user.getRole());
    }

    @GetMapping("/{id}")
    public CourseResponse getCourseById(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return courseService.getCourseById(id, user.getId(), user.getRole());
    }

    @GetMapping("/code/{courseCode}")
    public CourseResponse getCourseByCode(@AuthenticationPrincipal User user, @PathVariable String courseCode) {
        return courseService.getCourseByCode(courseCode, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<UserResponse> getCourseStudents(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return courseService.getCourseStudents(id, user.getId(), user.getRole());
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public CourseNoteResponse createNote(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam("file") MultipartFile file) {
        return courseNoteService.createNote(id, user.getId(), user.getRole(), title, description, file);
    }

    @GetMapping("/{id}/notes")
    public List<CourseNoteResponse> getNotes(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return courseNoteService.getAllNotes(id, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/notes/{noteId}")
    public CourseNoteResponse getNote(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long noteId) {
        return courseNoteService.getNote(id, noteId, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/notes/{noteId}/download")
    public ResponseEntity<Void> downloadNote(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long noteId) {
        String fileUrl = courseNoteService.getNoteDownloadUrl(id, noteId, user.getId(), user.getRole());
        return ResponseEntity.status(302).location(URI.create(fileUrl)).build();
    }

    @PutMapping("/{id}/notes/{noteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public CourseNoteResponse updateNote(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long noteId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return courseNoteService.updateNote(id, noteId, user.getId(), user.getRole(), title, description, file);
    }

    @DeleteMapping("/{id}/notes/{noteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public void deleteNote(@AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long noteId) {
        courseNoteService.deleteNote(id, noteId, user.getId(), user.getRole());
    }

    @PostMapping("/{id}/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public CourseAssignmentResponse createAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueAt,
            @RequestParam("file") MultipartFile file) {
        return courseAssignmentService.createAssignment(
                id, user.getId(), user.getRole(), title, description, dueAt, file);
    }

    @GetMapping("/{id}/assignments")
    public List<CourseAssignmentResponse> getAssignments(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return courseAssignmentService.getAllAssignments(id, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/assignments/{assignmentId}")
    public CourseAssignmentResponse getAssignment(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long assignmentId) {
        return courseAssignmentService.getAssignment(id, assignmentId, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/assignments/{assignmentId}/download")
    public ResponseEntity<Void> downloadAssignment(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long assignmentId) {
        String fileUrl =
                courseAssignmentService.getAssignmentDownloadUrl(id, assignmentId, user.getId(), user.getRole());
        return ResponseEntity.status(302).location(URI.create(fileUrl)).build();
    }

    @PutMapping("/{id}/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public CourseAssignmentResponse updateAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long assignmentId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueAt,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return courseAssignmentService.updateAssignment(
                id, assignmentId, user.getId(), user.getRole(), title, description, dueAt, file);
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public void deleteAssignment(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long assignmentId) {
        courseAssignmentService.deleteAssignment(id, assignmentId, user.getId(), user.getRole());
    }

    @PostMapping("/{id}/assignments/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public AssignmentSubmissionResponse submitAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long assignmentId,
            @RequestParam(required = false) String submissionNote,
            @RequestParam("file") MultipartFile file) {
        return assignmentSubmissionService.submitAssignment(
                id, assignmentId, user.getId(), user.getRole(), submissionNote, file);
    }

    @GetMapping("/{id}/assignments/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public AssignmentSubmissionResponse getMySubmission(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long assignmentId) {
        return assignmentSubmissionService.getMySubmission(id, assignmentId, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/assignments/{assignmentId}/submission/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> downloadMySubmission(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long assignmentId) {
        String fileUrl =
                assignmentSubmissionService.getMySubmissionDownloadUrl(id, assignmentId, user.getId(), user.getRole());
        return ResponseEntity.status(302).location(URI.create(fileUrl)).build();
    }

    @PutMapping("/{id}/assignments/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public AssignmentSubmissionResponse updateMySubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long assignmentId,
            @RequestParam(required = false) String submissionNote,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return assignmentSubmissionService.updateMySubmission(
                id, assignmentId, user.getId(), user.getRole(), submissionNote, file);
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public void deleteMySubmission(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long assignmentId) {
        assignmentSubmissionService.deleteMySubmission(id, assignmentId, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<AssignmentSubmissionResponse> getAssignmentSubmissions(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable Long assignmentId) {
        return assignmentSubmissionService.getAssignmentSubmissions(id, assignmentId, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/assignments/{assignmentId}/submissions/{submissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public AssignmentSubmissionResponse getAssignmentSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long assignmentId,
            @PathVariable Long submissionId) {
        return assignmentSubmissionService.getAssignmentSubmission(
                id, assignmentId, submissionId, user.getId(), user.getRole());
    }

    @GetMapping("/{id}/assignments/{assignmentId}/submissions/{submissionId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> downloadAssignmentSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long assignmentId,
            @PathVariable Long submissionId) {
        String fileUrl = assignmentSubmissionService.getAssignmentSubmissionDownloadUrl(
                id, assignmentId, submissionId, user.getId(), user.getRole());
        return ResponseEntity.status(302).location(URI.create(fileUrl)).build();
    }

    @PutMapping("/{id}/assignments/{assignmentId}/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public AssignmentSubmissionResponse gradeSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long assignmentId,
            @PathVariable Long submissionId,
            @Valid @RequestBody GradeAssignmentSubmissionRequest request) {
        return assignmentSubmissionService.gradeSubmission(
                id, assignmentId, submissionId, user.getId(), user.getRole(), request);
    }
}
