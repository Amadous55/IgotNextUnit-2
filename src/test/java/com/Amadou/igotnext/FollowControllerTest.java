package com.Amadou.igotnext;

import com.Amadou.igotnext.models.User;
import com.Amadou.igotnext.repositories.FollowRepository;
import com.Amadou.igotnext.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class FollowControllerTest {

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository userRepository;
    @Autowired private FollowRepository followRepository;
    @Autowired private BCryptPasswordEncoder passwordEncoder;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
        followRepository.deleteAll();
        userRepository.deleteAll();
        userRepository.save(new User("alice", "alice@test.com", passwordEncoder.encode("pass")));
        userRepository.save(new User("bob", "bob@test.com", passwordEncoder.encode("pass")));
    }

    private org.springframework.test.web.servlet.ResultActions postFollow(String body) throws Exception {
        return mvc.perform(post("/api/follow")
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void follow_validUsers_returns200() throws Exception {
        postFollow("{\"followerUsername\":\"alice\",\"followingUsername\":\"bob\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Followed successfully"));
    }

    @Test
    void follow_selfFollow_returns400() throws Exception {
        postFollow("{\"followerUsername\":\"alice\",\"followingUsername\":\"alice\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Cannot follow yourself"));
    }

    @Test
    void follow_duplicate_returns400() throws Exception {
        String body = "{\"followerUsername\":\"alice\",\"followingUsername\":\"bob\"}";
        postFollow(body);
        postFollow(body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Already following"));
    }

    @Test
    void follow_unknownUser_returns400() throws Exception {
        postFollow("{\"followerUsername\":\"alice\",\"followingUsername\":\"ghost\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User not found"));
    }

    @Test
    void unfollow_afterFollowing_returns200() throws Exception {
        postFollow("{\"followerUsername\":\"alice\",\"followingUsername\":\"bob\"}");
        mvc.perform(delete("/api/follow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"followerUsername\":\"alice\",\"followingUsername\":\"bob\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Unfollowed successfully"));
    }

    @Test
    void getFollowing_returnsCorrectList() throws Exception {
        postFollow("{\"followerUsername\":\"alice\",\"followingUsername\":\"bob\"}");
        mvc.perform(get("/api/users/alice/following"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("bob"));
    }

    @Test
    void getFollowers_returnsCorrectList() throws Exception {
        postFollow("{\"followerUsername\":\"alice\",\"followingUsername\":\"bob\"}");
        mvc.perform(get("/api/users/bob/followers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("alice"));
    }
}
