package com.workforce360.dto;

import com.workforce360.entity.LeaveStatus;
import com.workforce360.entity.LeaveType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveResponseDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double numberOfDays;
    private Boolean isHalfDay;
    private String halfDayPeriod;
    private String reason;
    private String rejectionReason;
    private LeaveStatus status;
    private LocalDateTime appliedAt;

    public LeaveResponseDTO() {
    }

    public LeaveResponseDTO(Long id, Long employeeId, String employeeName, String employeeEmail, String department,
                            LeaveType leaveType, LocalDate startDate, LocalDate endDate, Double numberOfDays,
                            Boolean isHalfDay, String halfDayPeriod, String reason, String rejectionReason,
                            LeaveStatus status, LocalDateTime appliedAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeEmail = employeeEmail;
        this.department = department;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.numberOfDays = numberOfDays;
        this.isHalfDay = isHalfDay;
        this.halfDayPeriod = halfDayPeriod;
        this.reason = reason;
        this.rejectionReason = rejectionReason;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeEmail() {
        return employeeEmail;
    }

    public void setEmployeeEmail(String employeeEmail) {
        this.employeeEmail = employeeEmail;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
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
