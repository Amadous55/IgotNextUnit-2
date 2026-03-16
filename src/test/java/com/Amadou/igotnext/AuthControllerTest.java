package com.Amadou.igotnext;

import com.Amadou.igotnext.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class AuthControllerTest {

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository userRepository;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
        userRepository.deleteAll();
    }

    private org.springframework.test.web.servlet.ResultActions doPost(String path, String json) throws Exception {
        return mvc.perform(post(path)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    @Test
    void register_validData_returns200() throws Exception {
        doPost("/api/auth/register",
                "{\"username\":\"u1\",\"email\":\"u1@x.com\",\"password\":\"pass\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("u1"));
    }

    @Test
    void register_duplicateUsername_returns400() throws Exception {
        doPost("/api/auth/register", "{\"username\":\"dup\",\"email\":\"a@x.com\",\"password\":\"p\"}");
        doPost("/api/auth/register", "{\"username\":\"dup\",\"email\":\"b@x.com\",\"password\":\"p\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Username already taken"));
    }

    @Test
    void register_missingPassword_returns400() throws Exception {
        doPost("/api/auth/register", "{\"username\":\"u2\",\"email\":\"u2@x.com\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("All fields are required"));
    }

    @Test
    void login_correctCredentials_returns200() throws Exception {
        doPost("/api/auth/register", "{\"username\":\"lu\",\"email\":\"lu@x.com\",\"password\":\"mypass\"}");
        doPost("/api/auth/login", "{\"username\":\"lu\",\"password\":\"mypass\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("lu"));
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        doPost("/api/auth/register", "{\"username\":\"wu\",\"email\":\"wu@x.com\",\"password\":\"correct\"}");
        doPost("/api/auth/login", "{\"username\":\"wu\",\"password\":\"wrong\"}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid username or password"));
    }

    @Test
    void login_nonexistentUser_returns401() throws Exception {
        doPost("/api/auth/login", "{\"username\":\"ghost\",\"password\":\"pass\"}")
                .andExpect(status().isUnauthorized());
    }
}
