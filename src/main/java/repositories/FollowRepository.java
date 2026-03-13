package com.Amadou.igotnext.repositories;

import com.Amadou.igotnext.models.Follow;
import com.Amadou.igotnext.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowing(User following);
    boolean existsByFollowerAndFollowing(User follower, User following);

    @Transactional
    void deleteByFollowerAndFollowing(User follower, User following);
}
