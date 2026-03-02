package com.Amadou.igotnext.controllers;

import com.Amadou.igotnext.models.Court;
import com.Amadou.igotnext.repositories.CourtRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/courts")
public class CourtController {

    private final CourtRepository courtRepository;

    public CourtController(CourtRepository courtRepository) {
        this.courtRepository = courtRepository;
    }

    @GetMapping
    public List<Court> getAll() {
        return courtRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Court> getOne(@PathVariable Long id) {
        return courtRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Court> create(@RequestBody Court court) {
        if (court.getName() == null || court.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Court saved = courtRepository.save(court);
        return ResponseEntity.created(URI.create("/api/courts/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!courtRepository.existsById(id)) return ResponseEntity.notFound().build();
        courtRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}