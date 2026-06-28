package com.exotel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "missed_calls", indexes = {
    @Index(name = "idx_call_sid", columnList = "call_sid", unique = true),
    @Index(name = "idx_caller_number", columnList = "caller_number"),
    @Index(name = "idx_start_time", columnList = "start_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissedCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "call_sid", length = 64, unique = true, nullable = false)
    private String callSid;

    @Column(name = "caller_number", length = 20, nullable = false)
    private String callerNumber;

    @Column(name = "exotel_number", length = 20, nullable = false)
    private String exotelNumber;

    @Column(name = "call_status", length = 32, nullable = false)
    private String callStatus;

    @Column(name = "direction", length = 16, nullable = false)
    private String direction;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "duration")
    private Integer duration;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
