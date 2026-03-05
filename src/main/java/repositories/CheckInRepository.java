package com.Amadou.igotnext.repositories;

import com.Amadou.igotnext.models.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    @Query("select coalesce(sum(c.partySize), 0) from CheckIn c where c.court.id = :courtId and c.createdAt > :after")
    long sumPartySizeAfter(@Param("courtId") Long courtId, @Param("after") Instant after);

    List<CheckIn> findByCourt_IdOrderByCreatedAtDesc(Long courtId);
}