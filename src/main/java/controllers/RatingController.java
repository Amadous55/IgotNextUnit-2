package com.Amadou.igotnext.controllers;

import com.Amadou.igotnext.models.Court;
import com.Amadou.igotnext.models.Rating;
import com.Amadou.igotnext.repositories.CourtRepository;
import com.Amadou.igotnext.repositories.RatingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class RatingController {

    private final RatingRepository ratingRepository;
    private final CourtRepository courtRepository;

    public RatingController(RatingRepository ratingRepository, CourtRepository courtRepository) {
        this.ratingRepository = ratingRepository;
        this.courtRepository = courtRepository;
    }

    public static class CreateRatingRequest {
        public Integer score;
    }

    // POST /api/courts/{courtId}/ratings
    @PostMapping("/courts/{courtId}/ratings")
    public ResponseEntity<Rating> create(@PathVariable Long courtId,
                                         @RequestBody CreateRatingRequest body) {
        if (body == null || body.score == null || body.score < 1 || body.score > 5) {
            return ResponseEntity.badRequest().build();
        }

        Court court = courtRepository.findById(courtId).orElse(null);
        if (court == null) return ResponseEntity.notFound().build();

        Rating saved = ratingRepository.save(new Rating(court, body.score));
        return ResponseEntity.ok(saved);
    }

    // GET /api/courts/{courtId}/ratings/average
    @GetMapping("/courts/{courtId}/ratings/average")
    public ResponseEntity<Map<String, Object>> average(@PathVariable Long courtId) {
        if (!courtRepository.existsById(courtId)) return ResponseEntity.notFound().build();

        double avg = ratingRepository.averageScoreByCourtId(courtId);
        long count = ratingRepository.countByCourtId(courtId);

        return ResponseEntity.ok(Map.of(
                "courtId", courtId,
                "average", Math.round(avg * 10.0) / 10.0,
                "count", count
        ));
    }
}
