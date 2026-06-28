package com.exotel.service;

import com.exotel.dto.MissedCallDto;
import com.exotel.dto.StatisticsDto;
import com.exotel.dto.WebhookPayloadDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface MissedCallService {

    MissedCallDto saveWebhookCall(WebhookPayloadDto webhookPayloadDto);

    MissedCallDto getCallById(Long id);

    MissedCallDto getCallByCallSid(String callSid);

    MissedCallDto updateCall(Long id, MissedCallDto missedCallDto);

    void deleteCall(Long id);

    Page<MissedCallDto> searchAndFilterCalls(
            String search,
            String status,
            String direction,
            String callerNumber,
            String exotelNumber,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Pageable pageable
    );

    StatisticsDto getStatistics();

    int syncHistoricalCalls();
}
