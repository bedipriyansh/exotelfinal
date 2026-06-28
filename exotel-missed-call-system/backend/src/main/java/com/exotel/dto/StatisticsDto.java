package com.exotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsDto {
    private long totalCalls;
    private long todayCalls;
    private long weeklyCalls;
    private long missedCallsCount;
    private long completedCallsCount;
    private Map<String, Long> dailyCounts; // Key: Date (yyyy-MM-dd), Value: Count
    private Map<String, Long> statusCounts; // Key: Status (e.g. missed, completed), Value: Count
}
