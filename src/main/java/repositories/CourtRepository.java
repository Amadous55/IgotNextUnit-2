package com.Amadou.igotnext.repositories;

import com.Amadou.igotnext.models.Court;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourtRepository extends JpaRepository<Court, Long> {
}