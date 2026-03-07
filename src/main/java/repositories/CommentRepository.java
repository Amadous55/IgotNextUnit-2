package com.Amadou.igotnext.repositories;

import com.Amadou.igotnext.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByCourt_IdOrderByCreatedAtDesc(Long courtId);
}
