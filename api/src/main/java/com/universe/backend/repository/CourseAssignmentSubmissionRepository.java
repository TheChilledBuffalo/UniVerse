package com.universe.backend.repository;

import com.universe.backend.entity.CourseAssignmentSubmission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseAssignmentSubmissionRepository extends JpaRepository<CourseAssignmentSubmission, Long> {

    Optional<CourseAssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    List<CourseAssignmentSubmission> findByAssignmentIdOrderBySubmittedAtDesc(Long assignmentId);

    Optional<CourseAssignmentSubmission> findByIdAndAssignmentId(Long id, Long assignmentId);
}
