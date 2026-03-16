package com.Amadou.igotnext.controllers;
import java.util.List;
import com.Amadou.igotnext.models.CheckIn;
import com.Amadou.igotnext.models.Court;
import com.Amadou.igotnext.repositories.CheckInRepository;
import com.Amadou.igotnext.repositories.CourtRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CheckInController {

    private final CheckInRepository checkInRepository;
    private final CourtRepository courtRepository;

    public CheckInController(CheckInRepository checkInRepository, CourtRepository courtRepository) {
        this.checkInRepository = checkInRepository;
        this.courtRepository = courtRepository;
    }

    public static class CreateCheckInRequest {
        public Integer partySize;
        public String username;
    }

    // POST /api/courts/{courtId}/checkins
    @PostMapping("/courts/{courtId}/checkins")
    public ResponseEntity<CheckIn> create(@PathVariable Long courtId,
                                          @RequestBody CreateCheckInRequest body) {
        if (body == null || body.partySize == null || body.partySize < 1) {
            return ResponseEntity.badRequest().build();
        }

        Court court = courtRepository.findById(courtId).orElse(null);
        if (court == null) return ResponseEntity.notFound().build();

        CheckIn checkin = new CheckIn(court, body.partySize);
        if (body.username != null) checkin.setUsername(body.username);
        CheckIn saved = checkInRepository.save(checkin);
        return ResponseEntity.ok(saved);
    }

    // GET /api/courts/{courtId}/checkins
    @GetMapping("/courts/{courtId}/checkins")
    public ResponseEntity<List<CheckIn>> getCheckInsForCourt(@PathVariable Long courtId) {
        if (!courtRepository.existsById(courtId)) return ResponseEntity.notFound().build();
        List<CheckIn> checkIns = checkInRepository.findByCourt_IdOrderByCreatedAtDesc(courtId);
        return ResponseEntity.ok(checkIns);
    }

    // GET /api/users/{username}/checkins
    @GetMapping("/users/{username}/checkins")
    public ResponseEntity<List<CheckIn>> getCheckInsForUser(@PathVariable String username) {
        List<CheckIn> checkIns = checkInRepository.findByUsernameOrderByCreatedAtDesc(username);
        return ResponseEntity.ok(checkIns);
    }

    // GET /api/courts/{courtId}/live-count?minutes=90
    @GetMapping("/courts/{courtId}/live-count")
    public ResponseEntity<Map<String, Object>> liveCount(@PathVariable Long courtId,
                                                         @RequestParam(defaultValue = "90") long minutes) {
        if (!courtRepository.existsById(courtId)) return ResponseEntity.notFound().build();

        Instant after = Instant.now().minus(Duration.ofMinutes(minutes));
        long playerCount = checkInRepository.sumPartySizeAfter(courtId, after);

        return ResponseEntity.ok(Map.of(
                "courtId", courtId,
                "minutes", minutes,
                "playerCount", playerCount
        ));
    }

    // DELETE /api/checkins/{id}
    @DeleteMapping("/checkins/{id}")
    public ResponseEntity<Void> deleteCheckIn(@PathVariable("id") Long id) {
        if (!checkInRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        checkInRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
