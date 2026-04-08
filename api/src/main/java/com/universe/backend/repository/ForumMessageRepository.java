package com.universe.backend.repository;

import com.universe.backend.entity.ForumMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumMessageRepository extends JpaRepository<ForumMessage, Long> {
    List<ForumMessage> findByCourseIdOrderByCreatedAtAsc(Long courseId);
}
