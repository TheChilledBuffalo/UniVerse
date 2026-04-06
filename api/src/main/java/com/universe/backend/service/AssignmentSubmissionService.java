package com.universe.backend.service;

import com.universe.backend.dto.requests.GradeAssignmentSubmissionRequest;
import com.universe.backend.dto.responses.AssignmentSubmissionResponse;
import com.universe.backend.entity.CourseAssignment;
import com.universe.backend.entity.CourseAssignmentSubmission;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.CourseAssignmentRepository;
import com.universe.backend.repository.CourseAssignmentSubmissionRepository;
import com.universe.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AssignmentSubmissionService {

    private final CourseService courseService;
    private final CourseAssignmentRepository courseAssignmentRepository;
    private final CourseAssignmentSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public AssignmentSubmissionResponse submitAssignment(
            Long courseId, Long assignmentId, Long userId, Role role, String submissionNote, MultipartFile file) {

        if (role != Role.STUDENT) {
            throw new RuntimeException("Only students can submit assignments");
        }

        courseService.getAccessibleCourse(courseId, userId, role);
        CourseAssignment assignment = getAssignmentOrThrow(courseId, assignmentId);
        User student = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Submission file is required");
        }

        CourseAssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, userId)
                .orElseGet(() -> CourseAssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        submission.setSubmissionNote(submissionNote);
        submission.setFileUrl(fileStorageService.uploadFile(file));
        submission.setOriginalFileName(file.getOriginalFilename());
        submission.setContentType(file.getContentType());
        submission.setFileSize(file.getSize());

        // Re-submission invalidates existing grade until teacher reviews latest upload.
        submission.setGradeScore(null);
        submission.setGradeFeedback(null);
        submission.setGradedAt(null);
        submission.setGradedBy(null);

        submissionRepository.save(submission);
        return mapToResponse(submission);
    }

    public AssignmentSubmissionResponse getMySubmission(Long courseId, Long assignmentId, Long userId, Role role) {
        if (role != Role.STUDENT) {
            throw new RuntimeException("Only students can view their own submissions from this endpoint");
        }

        courseService.getAccessibleCourse(courseId, userId, role);
        getAssignmentOrThrow(courseId, assignmentId);

        CourseAssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, userId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        return mapToResponse(submission);
    }

    public String getMySubmissionDownloadUrl(Long courseId, Long assignmentId, Long userId, Role role) {
        return fileStorageService.getPresignedDownloadUrl(
                getMySubmissionEntity(courseId, assignmentId, userId, role).getFileUrl());
    }

    public AssignmentSubmissionResponse updateMySubmission(
            Long courseId, Long assignmentId, Long userId, Role role, String submissionNote, MultipartFile file) {

        if (role != Role.STUDENT) {
            throw new RuntimeException("Only students can update submissions");
        }

        CourseAssignmentSubmission submission = getMySubmissionEntity(courseId, assignmentId, userId, role);

        if (submissionNote != null) {
            submission.setSubmissionNote(submissionNote);
        }

        if (file != null && !file.isEmpty()) {
            submission.setFileUrl(fileStorageService.uploadFile(file));
            submission.setOriginalFileName(file.getOriginalFilename());
            submission.setContentType(file.getContentType());
            submission.setFileSize(file.getSize());

            submission.setGradeScore(null);
            submission.setGradeFeedback(null);
            submission.setGradedAt(null);
            submission.setGradedBy(null);
        }

        submissionRepository.save(submission);
        return mapToResponse(submission);
    }

    public void deleteMySubmission(Long courseId, Long assignmentId, Long userId, Role role) {
        if (role != Role.STUDENT) {
            throw new RuntimeException("Only students can delete submissions");
        }

        CourseAssignmentSubmission submission = getMySubmissionEntity(courseId, assignmentId, userId, role);
        submissionRepository.delete(submission);
    }

    public List<AssignmentSubmissionResponse> getAssignmentSubmissions(
            Long courseId, Long assignmentId, Long userId, Role role) {

        courseService.getManageableCourse(courseId, userId, role);
        getAssignmentOrThrow(courseId, assignmentId);

        return submissionRepository.findByAssignmentIdOrderBySubmittedAtDesc(assignmentId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AssignmentSubmissionResponse getAssignmentSubmission(
            Long courseId, Long assignmentId, Long submissionId, Long userId, Role role) {

        courseService.getManageableCourse(courseId, userId, role);
        getAssignmentOrThrow(courseId, assignmentId);

        CourseAssignmentSubmission submission = submissionRepository
                .findByIdAndAssignmentId(submissionId, assignmentId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        return mapToResponse(submission);
    }

    public String getAssignmentSubmissionDownloadUrl(
            Long courseId, Long assignmentId, Long submissionId, Long userId, Role role) {

        courseService.getManageableCourse(courseId, userId, role);
        getAssignmentOrThrow(courseId, assignmentId);

        CourseAssignmentSubmission submission = submissionRepository
                .findByIdAndAssignmentId(submissionId, assignmentId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        return fileStorageService.getPresignedDownloadUrl(submission.getFileUrl());
    }

    public AssignmentSubmissionResponse gradeSubmission(
            Long courseId,
            Long assignmentId,
            Long submissionId,
            Long userId,
            Role role,
            GradeAssignmentSubmissionRequest request) {

        courseService.getManageableCourse(courseId, userId, role);
        getAssignmentOrThrow(courseId, assignmentId);

        CourseAssignmentSubmission submission = submissionRepository
                .findByIdAndAssignmentId(submissionId, assignmentId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        User grader = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        submission.setGradeScore(request.getGradeScore());
        submission.setGradeFeedback(request.getGradeFeedback());
        submission.setGradedBy(grader);
        submission.setGradedAt(LocalDateTime.now());

        submissionRepository.save(submission);
        return mapToResponse(submission);
    }

    private CourseAssignmentSubmission getMySubmissionEntity(Long courseId, Long assignmentId, Long userId, Role role) {
        courseService.getAccessibleCourse(courseId, userId, role);
        getAssignmentOrThrow(courseId, assignmentId);

        return submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, userId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    private CourseAssignment getAssignmentOrThrow(Long courseId, Long assignmentId) {
        return courseAssignmentRepository
                .findByIdAndCourseId(assignmentId, courseId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    private AssignmentSubmissionResponse mapToResponse(CourseAssignmentSubmission submission) {
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .courseId(submission.getAssignment().getCourse().getId())
                .assignmentId(submission.getAssignment().getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getName())
                .submissionNote(submission.getSubmissionNote())
                .fileUrl(submission.getFileUrl())
                .originalFileName(submission.getOriginalFileName())
                .contentType(submission.getContentType())
                .fileSize(submission.getFileSize())
                .gradeScore(submission.getGradeScore())
                .gradeFeedback(submission.getGradeFeedback())
                .gradedById(
                        submission.getGradedBy() != null
                                ? submission.getGradedBy().getId()
                                : null)
                .gradedByName(
                        submission.getGradedBy() != null
                                ? submission.getGradedBy().getName()
                                : null)
                .gradedAt(submission.getGradedAt())
                .submittedAt(submission.getSubmittedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }
}
