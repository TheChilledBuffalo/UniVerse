package com.universe.backend.repository;

import com.universe.backend.entity.CourseNote;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseNoteRepository extends JpaRepository<CourseNote, Long> {

    List<CourseNote> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<CourseNote> findByIdAndCourseId(Long id, Long courseId);
}
