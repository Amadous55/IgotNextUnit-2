package com.Amadou.igotnext.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false)
    private Instant createdAt;

    public Comment() {}

    public Comment(Court court, String username, String text) {
        this.court = court;
        this.username = username;
        this.text = text;
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Court getCourt() { return court; }
    public String getUsername() { return username; }
    public String getText() { return text; }
    public Instant getCreatedAt() { return createdAt; }

    public void setCourt(Court court) { this.court = court; }
    public void setUsername(String username) { this.username = username; }
    public void setText(String text) { this.text = text; }
}
