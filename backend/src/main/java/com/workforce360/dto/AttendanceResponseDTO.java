package com.workforce360.dto;

import com.workforce360.entity.AttendanceStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceResponseDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;
    private LocalDate date;
    private AttendanceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double totalHours;

    public AttendanceResponseDTO() {
    }

    public AttendanceResponseDTO(Long id, Long employeeId, String employeeName, String employeeEmail, String department,
                                 LocalDate date, AttendanceStatus status, LocalTime checkInTime,
                                 LocalTime checkOutTime, Double totalHours) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeEmail = employeeEmail;
        this.department = department;
        this.date = date;
        this.status = status;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.totalHours = totalHours;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
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

    public Double getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(Double totalHours) {
        this.totalHours = totalHours;
    }
}
