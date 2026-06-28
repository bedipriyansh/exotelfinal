package com.exotel.service;

import com.exotel.client.ExotelRestClient;
import com.exotel.dto.ExotelCallDetail;
import com.exotel.dto.MissedCallDto;
import com.exotel.dto.StatisticsDto;
import com.exotel.dto.WebhookPayloadDto;
import com.exotel.entity.MissedCall;
import com.exotel.exception.DuplicateCallSidException;
import com.exotel.exception.ResourceNotFoundException;
import com.exotel.mapper.MissedCallMapper;
import com.exotel.repository.MissedCallRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class MissedCallServiceImpl implements MissedCallService {

    private final MissedCallRepository repository;
    private final MissedCallMapper mapper;
    private final ExotelRestClient restClient;

    @Override
    @Transactional
    public MissedCallDto saveWebhookCall(WebhookPayloadDto payload) {
        payload.validate();
        String callSid = payload.getResolvedCallSid();

        log.info("Processing webhook for callSid: {}", callSid);

        if (repository.existsByCallSid(callSid)) {
            log.warn("CallSid {} already exists, updating existing call record", callSid);
            MissedCall existingCall = repository.findByCallSid(callSid).orElseThrow();
            existingCall.setCallStatus(payload.getResolvedStatus());
            existingCall.setEndTime(payload.getResolvedEndTime());
            existingCall.setDuration(payload.getResolvedDuration());
            MissedCall updated = repository.save(existingCall);
            return mapper.toDto(updated);
        }

        MissedCall missedCall = mapper.webhookPayloadToEntity(payload);
        MissedCall saved = repository.save(missedCall);
        log.info("Successfully stored new missed call record with ID: {}", saved.getId());
        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MissedCallDto getCallById(Long id) {
        MissedCall missedCall = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Missed call not found with ID: " + id));
        return mapper.toDto(missedCall);
    }

    @Override
    @Transactional(readOnly = true)
    public MissedCallDto getCallByCallSid(String callSid) {
        MissedCall missedCall = repository.findByCallSid(callSid)
                .orElseThrow(() -> new ResourceNotFoundException("Missed call not found with CallSid: " + callSid));
        return mapper.toDto(missedCall);
    }

    @Override
    @Transactional
    public MissedCallDto updateCall(Long id, MissedCallDto dto) {
        MissedCall existingCall = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Missed call not found with ID: " + id));

        existingCall.setCallerNumber(dto.getCallerNumber());
        existingCall.setExotelNumber(dto.getExotelNumber());
        existingCall.setCallStatus(dto.getCallStatus());
        existingCall.setDirection(dto.getDirection());
        existingCall.setStartTime(dto.getStartTime());
        existingCall.setEndTime(dto.getEndTime());
        existingCall.setDuration(dto.getDuration());

        MissedCall updated = repository.save(existingCall);
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteCall(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Missed call not found with ID: " + id);
        }
        repository.deleteById(id);
        log.info("Deleted call record with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MissedCallDto> searchAndFilterCalls(
            String search,
            String status,
            String direction,
            String callerNumber,
            String exotelNumber,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Pageable pageable
    ) {
        Specification<MissedCall> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim() + "%";
                predicates.add(cb.or(
                        cb.like(root.get("callSid"), searchPattern),
                        cb.like(root.get("callerNumber"), searchPattern),
                        cb.like(root.get("exotelNumber"), searchPattern)
                ));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("callStatus"), status.trim()));
            }

            if (direction != null && !direction.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("direction"), direction.trim()));
            }

            if (callerNumber != null && !callerNumber.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("callerNumber"), callerNumber.trim()));
            }

            if (exotelNumber != null && !exotelNumber.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("exotelNumber"), exotelNumber.trim()));
            }

            if (startTime != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startTime"), startTime));
            }

            if (endTime != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startTime"), endTime));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsDto getStatistics() {
        LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7).with(LocalTime.MIN);

        long totalCalls = repository.count();
        long todayCalls = repository.countCallsToday(startOfToday);
        long weeklyCalls = repository.countCallsThisWeek(startOfWeek);

        // Fetch status grouped counts
        List<Object[]> statusResults = repository.countByStatusGrouped();
        Map<String, Long> statusCounts = new HashMap<>();
        long missedCount = 0;
        long completedCount = 0;

        for (Object[] row : statusResults) {
            String status = (String) row[0];
            Long count = (Long) row[1];
            statusCounts.put(status, count);
            if ("missed".equalsIgnoreCase(status) || "no-answer".equalsIgnoreCase(status)) {
                missedCount += count;
            } else if ("completed".equalsIgnoreCase(status)) {
                completedCount += count;
            }
        }

        // Fetch daily counts for the last 7 days
        List<Object[]> dailyResults = repository.countCallsPerDaySince(LocalDateTime.now().minusDays(7).with(LocalTime.MIN));
        Map<String, Long> dailyCounts = new LinkedHashMap<>();

        // Initialize last 7 days with 0 counts to prevent missing keys on chart
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            String dateKey = LocalDate.now().minusDays(i).format(formatter);
            dailyCounts.put(dateKey, 0L);
        }

        for (Object[] row : dailyResults) {
            String date = (String) row[0];
            Long count = (Long) row[1];
            dailyCounts.put(date, count);
        }

        return StatisticsDto.builder()
                .totalCalls(totalCalls)
                .todayCalls(todayCalls)
                .weeklyCalls(weeklyCalls)
                .missedCallsCount(missedCount)
                .completedCallsCount(completedCount)
                .dailyCounts(dailyCounts)
                .statusCounts(statusCounts)
                .build();
    }

    @Override
    @Transactional
    public int syncHistoricalCalls() {
        log.info("Starting historical calls sync from Exotel...");
        List<ExotelCallDetail> callDetails = restClient.fetchCallLogs(50, 0);
        int newCallsCount = 0;

        for (ExotelCallDetail detail : callDetails) {
            if (detail.getSid() == null || repository.existsByCallSid(detail.getSid())) {
                continue;
            }

            WebhookPayloadDto dto = new WebhookPayloadDto();
            dto.setCallSid(detail.getSid());
            dto.setFrom(detail.getFrom());
            dto.setTo(detail.getTo());
            dto.setStatus(detail.getStatus());
            dto.setDirection(detail.getDirection());
            dto.setStartTime(detail.getStartTime());
            dto.setEndTime(detail.getEndTime());
            dto.setDuration(detail.getDuration());

            repository.save(mapper.webhookPayloadToEntity(dto));
            newCallsCount++;
        }

        log.info("Historical sync finished. Saved {} new calls.", newCallsCount);
        return newCallsCount;
    }
}
