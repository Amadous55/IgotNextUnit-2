package com.Amadou.igotnext.controllers;

import com.Amadou.igotnext.models.Follow;
import com.Amadou.igotnext.models.User;
import com.Amadou.igotnext.repositories.FollowRepository;
import com.Amadou.igotnext.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class FollowController {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowController(FollowRepository followRepository, UserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    // POST /api/follow — follow a user
    @PostMapping("/follow")
    public ResponseEntity<?> follow(@RequestBody Map<String, String> body) {
        String followerUsername = body.get("followerUsername");
        String followingUsername = body.get("followingUsername");

        Optional<User> follower = userRepository.findByUsername(followerUsername);
        Optional<User> following = userRepository.findByUsername(followingUsername);

        if (follower.isEmpty() || following.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        if (followerUsername.equals(followingUsername)) {
            return ResponseEntity.badRequest().body("Cannot follow yourself");
        }
        if (followRepository.existsByFollowerAndFollowing(follower.get(), following.get())) {
            return ResponseEntity.badRequest().body("Already following");
        }

        Follow follow = new Follow(follower.get(), following.get());
        followRepository.save(follow);
        return ResponseEntity.ok(Map.of("message", "Followed successfully"));
    }

    // DELETE /api/follow — unfollow a user
    @DeleteMapping("/follow")
    public ResponseEntity<?> unfollow(@RequestBody Map<String, String> body) {
        String followerUsername = body.get("followerUsername");
        String followingUsername = body.get("followingUsername");

        Optional<User> follower = userRepository.findByUsername(followerUsername);
        Optional<User> following = userRepository.findByUsername(followingUsername);

        if (follower.isEmpty() || following.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        followRepository.deleteByFollowerAndFollowing(follower.get(), following.get());
        return ResponseEntity.ok(Map.of("message", "Unfollowed successfully"));
    }

    // GET /api/users/{username}/following — who this user follows
    @GetMapping("/users/{username}/following")
    public ResponseEntity<?> getFollowing(@PathVariable String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) return ResponseEntity.notFound().build();

        List<Map<String, Object>> result = followRepository.findByFollower(user.get())
                .stream()
                .map(f -> Map.of(
                        "id", (Object) f.getFollowing().getId(),
                        "username", f.getFollowing().getUsername()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // GET /api/users/{username}/followers — who follows this user
    @GetMapping("/users/{username}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) return ResponseEntity.notFound().build();

        List<Map<String, Object>> result = followRepository.findByFollowing(user.get())
                .stream()
                .map(f -> Map.of(
                        "id", (Object) f.getFollower().getId(),
                        "username", f.getFollower().getUsername()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // GET /api/users — list all users (for finding people to follow)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(u -> Map.of(
                        "id", (Object) u.getId(),
                        "username", u.getUsername()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
