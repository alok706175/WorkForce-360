package com.workforce360.dto;

import com.workforce360.entity.LeaveType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class LeaveApplyDTO {

    @NotNull(message = "Leave type is required (CASUAL, SICK, ANNUAL)")
    private LeaveType leaveType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Boolean isHalfDay = false;

    private String halfDayPeriod; // "FIRST_HALF" or "SECOND_HALF"

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    public LeaveApplyDTO() {
    }

    public LeaveApplyDTO(LeaveType leaveType, LocalDate startDate, LocalDate endDate, Boolean isHalfDay, String halfDayPeriod, String reason) {
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isHalfDay = isHalfDay != null ? isHalfDay : false;
        this.halfDayPeriod = halfDayPeriod;
        this.reason = reason;
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
}
