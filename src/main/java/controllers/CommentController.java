package com.Amadou.igotnext.controllers;

import com.Amadou.igotnext.models.Comment;
import com.Amadou.igotnext.models.Court;
import com.Amadou.igotnext.repositories.CommentRepository;
import com.Amadou.igotnext.repositories.CourtRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentRepository commentRepository;
    private final CourtRepository courtRepository;

    public CommentController(CommentRepository commentRepository, CourtRepository courtRepository) {
        this.commentRepository = commentRepository;
        this.courtRepository = courtRepository;
    }

    public static class CreateCommentRequest {
        public String username;
        public String text;
    }

    // GET /api/courts/{courtId}/comments
    @GetMapping("/courts/{courtId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long courtId) {
        if (!courtRepository.existsById(courtId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(commentRepository.findByCourt_IdOrderByCreatedAtDesc(courtId));
    }

    // POST /api/courts/{courtId}/comments
    @PostMapping("/courts/{courtId}/comments")
    public ResponseEntity<Comment> create(@PathVariable Long courtId,
                                          @RequestBody CreateCommentRequest body) {
        if (body.text == null || body.text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Court court = courtRepository.findById(courtId).orElse(null);
        if (court == null) return ResponseEntity.notFound().build();

        String username = (body.username != null && !body.username.isBlank()) ? body.username : "Anonymous";
        Comment saved = commentRepository.save(new Comment(court, username, body.text.trim()));
        return ResponseEntity.ok(saved);
    }

    // DELETE /api/comments/{id}
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!commentRepository.existsById(id)) return ResponseEntity.notFound().build();
        commentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
