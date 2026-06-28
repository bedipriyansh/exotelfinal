package com.exotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissedCallDto {
    private Long id;
    private String callSid;
    private String callerNumber;
    private String exotelNumber;
    private String callStatus;
    private String direction;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
