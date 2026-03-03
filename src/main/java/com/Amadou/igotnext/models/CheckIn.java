
package com.Amadou.igotnext.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(
        name = "checkins"
)
public class CheckIn {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;
    @ManyToOne(
            optional = false
    )
    @JoinColumn(
            name = "court_id",
            nullable = false
    )
    private Court court;
    @Column(
            nullable = false
    )
    private Integer partySize;
    @Column(
            nullable = false
    )
    private Instant createdAt;

    public CheckIn() {
    }

    public CheckIn(Court court, Integer partySize) {
        this.court = court;
        this.partySize = partySize;
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }

    }

    public Long getId() {
        return this.id;
    }

    public Court getCourt() {
        return this.court;
    }

    public Integer getPartySize() {
        return this.partySize;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCourt(Court court) {
        this.court = court;
    }

    public void setPartySize(Integer partySize) {
        this.partySize = partySize;
    }
}
