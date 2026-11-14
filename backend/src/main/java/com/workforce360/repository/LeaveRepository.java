package com.workforce360.repository;

import com.workforce360.entity.LeaveRequest;
import com.workforce360.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeIdOrderByAppliedAtDesc(Long employeeId);
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveStatus status);
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
           "AND l.status IN :activeStatuses " +
           "AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<LeaveRequest> findOverlappingLeaves(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("activeStatuses") List<LeaveStatus> activeStatuses
    );
}
