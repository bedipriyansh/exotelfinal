package com.exotel.repository;

import com.exotel.entity.MissedCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MissedCallRepository extends JpaRepository<MissedCall, Long>, JpaSpecificationExecutor<MissedCall> {

    boolean existsByCallSid(String callSid);

    Optional<MissedCall> findByCallSid(String callSid);

    @Query("SELECT COUNT(c) FROM MissedCall c WHERE c.startTime >= :startOfDay")
    long countCallsToday(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COUNT(c) FROM MissedCall c WHERE c.startTime >= :startOfWeek")
    long countCallsThisWeek(@Param("startOfWeek") LocalDateTime startOfWeek);

    @Query("SELECT COUNT(c) FROM MissedCall c WHERE c.callStatus = :status")
    long countByCallStatus(@Param("status") String status);

    @Query("SELECT c.callStatus, COUNT(c) FROM MissedCall c GROUP BY c.callStatus")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT DATE_FORMAT(c.startTime, '%Y-%m-%d') as callDate, COUNT(c) FROM MissedCall c " +
           "WHERE c.startTime >= :since GROUP BY callDate ORDER BY callDate ASC")
    List<Object[]> countCallsPerDaySince(@Param("since") LocalDateTime since);
}
