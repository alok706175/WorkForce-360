package com.workforce360.dto;

import com.workforce360.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceDTO {

    @NotNull(message = "Attendance status is required (PRESENT, ABSENT, HALF_DAY)")
    private AttendanceStatus status;

    private LocalDate date;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;

    public AttendanceDTO() {
    }

    public AttendanceDTO(AttendanceStatus status, LocalDate date) {
        this.status = status;
        this.date = date;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }
}
