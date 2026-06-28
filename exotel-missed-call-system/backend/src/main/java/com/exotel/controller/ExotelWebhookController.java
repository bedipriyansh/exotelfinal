package com.exotel.controller;

import com.exotel.dto.MissedCallDto;
import com.exotel.dto.WebhookPayloadDto;
import com.exotel.service.MissedCallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exotel")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Exotel Webhook Controller", description = "Endpoints for receiving Exotel call status events")
public class ExotelWebhookController {

    private final MissedCallService service;

    @Operation(summary = "Handle Exotel Webhook via application/x-www-form-urlencoded")
    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<MissedCallDto> handleFormWebhook(WebhookPayloadDto payload) {
        log.info("Received Exotel Form-Urlencoded Webhook. CallSid: {}, From: {}, Status: {}", 
                payload.getResolvedCallSid(), payload.getResolvedFrom(), payload.getResolvedStatus());
        MissedCallDto result = service.saveWebhookCall(payload);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Handle Exotel Webhook via application/json")
    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MissedCallDto> handleJsonWebhook(@RequestBody WebhookPayloadDto payload) {
        log.info("Received Exotel JSON Webhook. CallSid: {}, From: {}, Status: {}", 
                payload.getResolvedCallSid(), payload.getResolvedFrom(), payload.getResolvedStatus());
        MissedCallDto result = service.saveWebhookCall(payload);
        return ResponseEntity.ok(result);
    }
}
