package com.exotel.mapper;

import com.exotel.dto.MissedCallDto;
import com.exotel.dto.WebhookPayloadDto;
import com.exotel.entity.MissedCall;
import org.springframework.stereotype.Component;

@Component
public class MissedCallMapper {

    public MissedCallDto toDto(MissedCall entity) {
        if (entity == null) {
            return null;
        }

        return MissedCallDto.builder()
                .id(entity.getId())
                .callSid(entity.getCallSid())
                .callerNumber(entity.getCallerNumber())
                .exotelNumber(entity.getExotelNumber())
                .callStatus(entity.getCallStatus())
                .direction(entity.getDirection())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .duration(entity.getDuration())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public MissedCall toEntity(MissedCallDto dto) {
        if (dto == null) {
            return null;
        }

        return MissedCall.builder()
                .id(dto.getId())
                .callSid(dto.getCallSid())
                .callerNumber(dto.getCallerNumber())
                .exotelNumber(dto.getExotelNumber())
                .callStatus(dto.getCallStatus())
                .direction(dto.getDirection())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .duration(dto.getDuration())
                .build();
    }

    public MissedCall webhookPayloadToEntity(WebhookPayloadDto webhookDto) {
        if (webhookDto == null) {
            return null;
        }

        return MissedCall.builder()
                .callSid(webhookDto.getResolvedCallSid())
                .callerNumber(webhookDto.getResolvedFrom())
                .exotelNumber(webhookDto.getResolvedTo())
                .callStatus(webhookDto.getResolvedStatus())
                .direction(webhookDto.getResolvedDirection())
                .startTime(webhookDto.getResolvedStartTime())
                .endTime(webhookDto.getResolvedEndTime())
                .duration(webhookDto.getResolvedDuration())
                .build();
    }
}
