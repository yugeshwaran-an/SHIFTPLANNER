package com.shiftplanner.repository;

import com.shiftplanner.entity.SwapRequest;
import com.shiftplanner.enums.SwapStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SwapRequestRepository extends JpaRepository<SwapRequest, Long> {
    List<SwapRequest> findByStatus(SwapStatus status);

    @Query("SELECT s FROM SwapRequest s WHERE s.requester.id = :employeeId OR s.colleague.id = :employeeId")
    List<SwapRequest> findByEmployeeId(@Param("employeeId") Long employeeId);

    List<SwapRequest> findByRequesterRosterIdOrColleagueRosterId(Long requesterRosterId, Long colleagueRosterId);
}
