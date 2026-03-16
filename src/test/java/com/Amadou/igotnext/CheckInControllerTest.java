package com.Amadou.igotnext;

import com.Amadou.igotnext.models.Court;
import com.Amadou.igotnext.repositories.CheckInRepository;
import com.Amadou.igotnext.repositories.CourtRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class CheckInControllerTest {

    @Autowired private WebApplicationContext context;
    @Autowired private CourtRepository courtRepository;
    @Autowired private CheckInRepository checkInRepository;
    private MockMvc mvc;
    private Long courtId;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
        checkInRepository.deleteAll();
        courtRepository.deleteAll();
        Court court = new Court();
        court.setName("Test Court");
        court.setCity("Chicago");
        court.setOutdoor(true);
        court = courtRepository.save(court);
        courtId = court.getId();
    }

    private org.springframework.test.web.servlet.ResultActions doCheckin(String body) throws Exception {
        return mvc.perform(post("/api/courts/" + courtId + "/checkins")
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void checkIn_validRequest_returns200() throws Exception {
        doCheckin("{\"partySize\":1,\"username\":\"player1\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.partySize").value(1));
    }

    @Test
    void checkIn_invalidPartySize_returns400() throws Exception {
        doCheckin("{\"partySize\":0}").andExpect(status().isBadRequest());
    }

    @Test
    void checkIn_nonexistentCourt_returns404() throws Exception {
        mvc.perform(post("/api/courts/99999/checkins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"partySize\":1}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void liveCount_afterCheckIn_reflectsPartySize() throws Exception {
        doCheckin("{\"partySize\":3,\"username\":\"p\"}");
        mvc.perform(get("/api/courts/" + courtId + "/live-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.playerCount").value(3));
    }

    @Test
    void deleteCheckIn_returns204() throws Exception {
        var result = doCheckin("{\"partySize\":1,\"username\":\"p2\"}").andReturn();
        String body = result.getResponse().getContentAsString();
        long id = Long.parseLong(body.replaceAll(".*\"id\":(\\d+).*", "$1"));
        mvc.perform(delete("/api/checkins/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteCheckIn_nonexistent_returns404() throws Exception {
        mvc.perform(delete("/api/checkins/99999")).andExpect(status().isNotFound());
    }

    @Test
    void getUserCheckins_returnsHistory() throws Exception {
        doCheckin("{\"partySize\":1,\"username\":\"hooper\"}");
        mvc.perform(get("/api/users/hooper/checkins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("hooper"));
    }
}
