package com.exotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Slf4j
public class WebhookPayloadDto {

    // Exotel PascalCase Parameters
    private String CallSid;
    private String From;
    private String To;
    private String Status;
    private String Direction;
    private String StartTime;
    private String EndTime;
    private String Duration;

    // Standard camelCase parameters
    private String callSid;
    private String from;
    private String to;
    private String status;
    private String direction;
    private String startTime;
    private String endTime;
    private String duration;

    // Resolvers
    public String getResolvedCallSid() {
        return callSid != null ? callSid : CallSid;
    }

    public String getResolvedFrom() {
        return from != null ? from : From;
    }

    public String getResolvedTo() {
        return to != null ? to : To;
    }

    public String getResolvedStatus() {
        String s = status != null ? status : Status;
        return s != null ? s : "missed";
    }

    public String getResolvedDirection() {
        String d = direction != null ? direction : Direction;
        return d != null ? d : "incoming";
    }

    public LocalDateTime getResolvedStartTime() {
        String st = startTime != null ? startTime : StartTime;
        if (st == null || st.trim().isEmpty()) {
            return LocalDateTime.now();
        }
        return parseDateTime(st);
    }

    public LocalDateTime getResolvedEndTime() {
        String et = endTime != null ? endTime : EndTime;
        if (et == null || et.trim().isEmpty()) {
            return null;
        }
        return parseDateTime(et);
    }

    public Integer getResolvedDuration() {
        String dur = duration != null ? duration : Duration;
        if (dur == null || dur.trim().isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(dur);
        } catch (NumberFormatException e) {
            log.warn("Invalid duration format: {}", dur);
            return 0;
        }
    }

    private LocalDateTime parseDateTime(String value) {
        try {
            // Exotel format is usually yyyy-MM-dd HH:mm:ss or ISO
            if (value.contains("T")) {
                return LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            log.warn("Failed to parse datetime: {}, using current system time", value, e);
            return LocalDateTime.now();
        }
    }

    public void validate() {
        if (getResolvedCallSid() == null || getResolvedCallSid().trim().isEmpty()) {
            throw new IllegalArgumentException("CallSid is required");
        }
        if (getResolvedFrom() == null || getResolvedFrom().trim().isEmpty()) {
            throw new IllegalArgumentException("From (caller number) is required");
        }
        if (getResolvedTo() == null || getResolvedTo().trim().isEmpty()) {
            throw new IllegalArgumentException("To (exotel number) is required");
        }
    }
}
