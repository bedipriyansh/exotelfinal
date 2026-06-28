package com.exotel.controller;

import com.exotel.dto.MissedCallDto;
import com.exotel.dto.WebhookPayloadDto;
import com.exotel.service.MissedCallService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(ExotelWebhookController.class)
public class ExotelWebhookControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MissedCallService service;

    @Autowired
    private ObjectMapper objectMapper;

    private MissedCallDto expectedDto;

    @BeforeEach
    void setUp() {
        expectedDto = MissedCallDto.builder()
                .id(1L)
                .callSid("test-sid-123")
                .callerNumber("+919999999999")
                .exotelNumber("+918888888888")
                .callStatus("missed")
                .direction("incoming")
                .build();
    }

    @Test
    void handleFormWebhook_Success() throws Exception {
        when(service.saveWebhookCall(any(WebhookPayloadDto.class))).thenReturn(expectedDto);

        mockMvc.perform(post("/api/exotel/webhook")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("CallSid", "test-sid-123")
                        .param("From", "+919999999999")
                        .param("To", "+918888888888")
                        .param("Status", "missed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.callSid").value("test-sid-123"))
                .andExpect(jsonPath("$.callerNumber").value("+919999999999"));
    }

    @Test
    void handleJsonWebhook_Success() throws Exception {
        when(service.saveWebhookCall(any(WebhookPayloadDto.class))).thenReturn(expectedDto);

        WebhookPayloadDto payload = new WebhookPayloadDto();
        payload.setCallSid("test-sid-123");
        payload.setFrom("+919999999999");
        payload.setTo("+918888888888");
        payload.setStatus("missed");

        mockMvc.perform(post("/api/exotel/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.callSid").value("test-sid-123"))
                .andExpect(jsonPath("$.callerNumber").value("+919999999999"));
    }
}
