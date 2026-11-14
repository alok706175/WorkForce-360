package com.workforce360.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull(message = "Leave type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false)
    private LeaveType leaveType;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "number_of_days", nullable = false)
    private Double numberOfDays;

    @Column(name = "is_half_day")
    private Boolean isHalfDay = false;

    @Column(name = "half_day_period")
    private String halfDayPeriod; // "FIRST_HALF" or "SECOND_HALF"

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    public LeaveRequest() {
    }

    public LeaveRequest(Employee employee, LeaveType leaveType, LocalDate startDate, LocalDate endDate,
                        Double numberOfDays, String reason, Boolean isHalfDay, String halfDayPeriod) {
        this.employee = employee;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.numberOfDays = numberOfDays;
        this.reason = reason;
        this.isHalfDay = isHalfDay != null ? isHalfDay : false;
        this.halfDayPeriod = halfDayPeriod;
        this.status = LeaveStatus.PENDING;
        this.appliedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = LeaveStatus.PENDING;
        }
        if (this.appliedAt == null) {
            this.appliedAt = LocalDateTime.now();
        }
        if (this.isHalfDay == null) {
            this.isHalfDay = false;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LeaveType getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Double getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(Double numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public Boolean getIsHalfDay() {
        return isHalfDay;
    }

    public void setIsHalfDay(Boolean halfDay) {
        isHalfDay = halfDay;
    }

    public String getHalfDayPeriod() {
        return halfDayPeriod;
    }

    public void setHalfDayPeriod(String halfDayPeriod) {
        this.halfDayPeriod = halfDayPeriod;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
}
