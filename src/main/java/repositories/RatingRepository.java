package com.Amadou.igotnext.repositories;

import com.Amadou.igotnext.models.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    @Query("select coalesce(avg(r.score), 0) from Rating r where r.court.id = :courtId")
    double averageScoreByCourtId(@Param("courtId") Long courtId);

    @Query("select count(r) from Rating r where r.court.id = :courtId")
    long countByCourtId(@Param("courtId") Long courtId);
}
