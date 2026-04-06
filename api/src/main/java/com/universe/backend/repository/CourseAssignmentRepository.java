package com.universe.backend.repository;

import com.universe.backend.entity.CourseAssignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseAssignmentRepository extends JpaRepository<CourseAssignment, Long> {

    List<CourseAssignment> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<CourseAssignment> findByIdAndCourseId(Long id, Long courseId);
}
