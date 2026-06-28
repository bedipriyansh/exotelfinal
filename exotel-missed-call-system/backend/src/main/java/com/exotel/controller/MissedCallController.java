package com.exotel.controller;

import com.exotel.dto.MissedCallDto;
import com.exotel.dto.StatisticsDto;
import com.exotel.service.MissedCallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Missed Call Controller", description = "Endpoints for managing and querying call records")
public class MissedCallController {

    private final MissedCallService service;

    private LocalDateTime parseDateTime(String dtStr) {
        if (dtStr == null || dtStr.trim().isEmpty()) {
            return null;
        }
        try {
            if (dtStr.contains("T")) {
                return LocalDateTime.parse(dtStr);
            }
            return LocalDateTime.parse(dtStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            log.warn("Invalid date format passed: {}", dtStr);
            return null;
        }
    }

    @Operation(summary = "Get paginated, filtered call list")
    @GetMapping("/calls")
    public ResponseEntity<Page<MissedCallDto>> getCalls(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) String callerNumber,
            @RequestParam(required = false) String exotelNumber,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        LocalDateTime start = parseDateTime(startTime);
        LocalDateTime end = parseDateTime(endTime);

        Page<MissedCallDto> calls = service.searchAndFilterCalls(null, status, direction, callerNumber, exotelNumber, start, end, pageable);
        return ResponseEntity.ok(calls);
    }

    @Operation(summary = "Get call details by database ID")
    @GetMapping("/calls/{id}")
    public ResponseEntity<MissedCallDto> getCallById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCallById(id));
    }

    @Operation(summary = "Update an existing call record")
    @PutMapping("/calls/{id}")
    public ResponseEntity<MissedCallDto> updateCall(@PathVariable Long id, @RequestBody MissedCallDto dto) {
        return ResponseEntity.ok(service.updateCall(id, dto));
    }

    @Operation(summary = "Delete a call record by database ID")
    @DeleteMapping("/calls/{id}")
    public ResponseEntity<Map<String, String>> deleteCall(@PathVariable Long id) {
        service.deleteCall(id);
        return ResponseEntity.ok(Map.of("message", "Call deleted successfully"));
    }

    @Operation(summary = "Search call logs by keyword")
    @GetMapping("/calls/search")
    public ResponseEntity<Page<MissedCallDto>> searchCalls(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<MissedCallDto> calls = service.searchAndFilterCalls(q, null, null, null, null, null, null, pageable);
        return ResponseEntity.ok(calls);
    }

    @Operation(summary = "Filter call logs with criteria")
    @GetMapping("/calls/filter")
    public ResponseEntity<Page<MissedCallDto>> filterCalls(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) String callerNumber,
            @RequestParam(required = false) String exotelNumber,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return getCalls(status, direction, callerNumber, exotelNumber, startTime, endTime, page, size, sortBy, sortDir);
    }

    @Operation(summary = "Get aggregated statistics for dashboard")
    @GetMapping("/calls/statistics")
    public ResponseEntity<StatisticsDto> getStatistics() {
        return ResponseEntity.ok(service.getStatistics());
    }

    @Operation(summary = "Sync call logs from Exotel REST API")
    @GetMapping("/exotel/sync")
    public ResponseEntity<Map<String, Object>> syncCalls() {
        int synced = service.syncHistoricalCalls();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Synced historical calls successfully",
                "callsSyncedCount", synced
        ));
    }
}
