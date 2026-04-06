package com.universe.backend.repository;

import com.universe.backend.entity.ForumReply;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumReplyRepository extends JpaRepository<ForumReply, Long> {
    List<ForumReply> findByPostIdOrderByCreatedAtAsc(Long postId);
}
