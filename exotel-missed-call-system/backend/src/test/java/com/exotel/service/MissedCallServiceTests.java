package com.exotel.service;

import com.exotel.client.ExotelRestClient;
import com.exotel.dto.ExotelCallDetail;
import com.exotel.dto.MissedCallDto;
import com.exotel.dto.StatisticsDto;
import com.exotel.dto.WebhookPayloadDto;
import com.exotel.entity.MissedCall;
import com.exotel.exception.ResourceNotFoundException;
import com.exotel.mapper.MissedCallMapper;
import com.exotel.repository.MissedCallRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MissedCallServiceTests {

    @Mock
    private MissedCallRepository repository;

    @Mock
    private MissedCallMapper mapper;

    @Mock
    private ExotelRestClient restClient;

    @InjectMocks
    private MissedCallServiceImpl service;

    private MissedCall sampleCall;
    private MissedCallDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleCall = MissedCall.builder()
                .id(1L)
                .callSid("test-sid-123")
                .callerNumber("+919999999999")
                .exotelNumber("+918888888888")
                .callStatus("missed")
                .direction("incoming")
                .startTime(LocalDateTime.now())
                .build();

        sampleDto = MissedCallDto.builder()
                .id(1L)
                .callSid("test-sid-123")
                .callerNumber("+919999999999")
                .exotelNumber("+918888888888")
                .callStatus("missed")
                .direction("incoming")
                .build();
    }

    @Test
    void getCallById_Success() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleCall));
        when(mapper.toDto(sampleCall)).thenReturn(sampleDto);

        MissedCallDto result = service.getCallById(1L);

        assertNotNull(result);
        assertEquals("test-sid-123", result.getCallSid());
        verify(repository, times(1)).findById(1L);
    }

    @Test
    void getCallById_NotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getCallById(1L));
    }

    @Test
    void saveWebhookCall_NewCall() {
        WebhookPayloadDto payload = new WebhookPayloadDto();
        payload.setCallSid("test-sid-123");
        payload.setFrom("+919999999999");
        payload.setTo("+918888888888");
        payload.setStatus("missed");

        when(repository.existsByCallSid("test-sid-123")).thenReturn(false);
        when(mapper.webhookPayloadToEntity(payload)).thenReturn(sampleCall);
        when(repository.save(any(MissedCall.class))).thenReturn(sampleCall);
        when(mapper.toDto(sampleCall)).thenReturn(sampleDto);

        MissedCallDto result = service.saveWebhookCall(payload);

        assertNotNull(result);
        assertEquals("test-sid-123", result.getCallSid());
        verify(repository, times(1)).save(any(MissedCall.class));
    }

    @Test
    void saveWebhookCall_ExistingCall() {
        WebhookPayloadDto payload = new WebhookPayloadDto();
        payload.setCallSid("test-sid-123");
        payload.setFrom("+919999999999");
        payload.setTo("+918888888888");
        payload.setStatus("completed");
        payload.setDuration("10");

        when(repository.existsByCallSid("test-sid-123")).thenReturn(true);
        when(repository.findByCallSid("test-sid-123")).thenReturn(Optional.of(sampleCall));
        when(repository.save(sampleCall)).thenReturn(sampleCall);
        when(mapper.toDto(sampleCall)).thenReturn(sampleDto);

        MissedCallDto result = service.saveWebhookCall(payload);

        assertNotNull(result);
        assertEquals("completed", sampleCall.getCallStatus());
        assertEquals(10, sampleCall.getDuration());
        verify(repository, times(1)).save(sampleCall);
    }

    @Test
    void getStatistics_Success() {
        when(repository.count()).thenReturn(10L);
        when(repository.countCallsToday(any(LocalDateTime.class))).thenReturn(3L);
        when(repository.countCallsThisWeek(any(LocalDateTime.class))).thenReturn(7L);
        when(repository.countByStatusGrouped()).thenReturn(Collections.emptyList());
        when(repository.countCallsPerDaySince(any(LocalDateTime.class))).thenReturn(Collections.emptyList());

        StatisticsDto stats = service.getStatistics();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalCalls());
        assertEquals(3L, stats.getTodayCalls());
        assertEquals(7L, stats.getWeeklyCalls());
    }

    @Test
    void syncHistoricalCalls_Success() {
        ExotelCallDetail detail = new ExotelCallDetail("sync-sid-1", "+919999999999", "+918888888888", "missed", "incoming", "2026-06-28 12:00:00", null, "0", "2026-06-28 12:00:00");
        when(restClient.fetchCallLogs(50, 0)).thenReturn(List.of(detail));
        when(repository.existsByCallSid("sync-sid-1")).thenReturn(false);
        when(mapper.webhookPayloadToEntity(any(WebhookPayloadDto.class))).thenReturn(sampleCall);

        int result = service.syncHistoricalCalls();

        assertEquals(1, result);
        verify(repository, times(1)).save(any(MissedCall.class));
    }
}
