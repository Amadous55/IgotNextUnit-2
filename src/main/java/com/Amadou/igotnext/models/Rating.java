package com.Amadou.igotnext.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(nullable = false)
    private Integer score; // 1-5

    @Column(nullable = false)
    private Instant createdAt;

    public Rating() {}

    public Rating(Court court, Integer score) {
        this.court = court;
        this.score = score;
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Court getCourt() { return court; }
    public Integer getScore() { return score; }
    public Instant getCreatedAt() { return createdAt; }

    public void setCourt(Court court) { this.court = court; }
    public void setScore(Integer score) { this.score = score; }
}
