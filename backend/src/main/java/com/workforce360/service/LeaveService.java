package com.workforce360.service;

import com.workforce360.dto.LeaveApplyDTO;
import com.workforce360.dto.LeaveResponseDTO;
import com.workforce360.entity.Employee;
import com.workforce360.entity.LeaveRequest;
import com.workforce360.entity.LeaveStatus;
import com.workforce360.exception.BadRequestException;
import com.workforce360.exception.ResourceNotFoundException;
import com.workforce360.repository.EmployeeRepository;
import com.workforce360.repository.LeaveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveService(LeaveRepository leaveRepository, EmployeeRepository employeeRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public LeaveResponseDTO applyLeave(String employeeEmail, LeaveApplyDTO dto) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        LocalDate startDate = dto.getStartDate();
        LocalDate endDate = dto.getEndDate();

        if (startDate == null || endDate == null) {
            throw new BadRequestException("Start date and end date are required");
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Leave start date cannot be in the past");
        }

        // 1. OVERLAPPING CHECK: Prevent applying for overlapping dates with PENDING or APPROVED requests
        List<LeaveRequest> overlapping = leaveRepository.findOverlappingLeaves(
                employee.getId(),
                startDate,
                endDate,
                List.of(LeaveStatus.PENDING, LeaveStatus.APPROVED)
        );

        if (!overlapping.isEmpty()) {
            LeaveRequest conflict = overlapping.get(0);
            throw new BadRequestException("You already have an active leave request (" 
                    + conflict.getStatus() + ") from " + conflict.getStartDate() 
                    + " to " + conflict.getEndDate() + ". Overlapping dates are not allowed!");
        }

        // 2. HALF-DAY vs FULL DURATION CALCULATION
        double numberOfDays;
        boolean isHalfDay = Boolean.TRUE.equals(dto.getIsHalfDay());
        String halfDayPeriod = null;

        if (isHalfDay) {
            if (!startDate.isEqual(endDate)) {
                throw new BadRequestException("Half-day leave must be on a single date (start date and end date must be the same)");
            }
            numberOfDays = 0.5;
            halfDayPeriod = dto.getHalfDayPeriod() != null ? dto.getHalfDayPeriod() : "FIRST_HALF";
        } else {
            numberOfDays = (double) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }

        if (numberOfDays <= 0) {
            throw new BadRequestException("Invalid leave duration");
        }

        if (employee.getAvailableLeaveDays() < numberOfDays) {
            throw new BadRequestException("Insufficient leave balance. You have "
                    + employee.getAvailableLeaveDays() + " day(s) remaining, but requested "
                    + numberOfDays + " day(s).");
        }

        LeaveRequest leaveRequest = new LeaveRequest(
                employee,
                dto.getLeaveType(),
                startDate,
                endDate,
                numberOfDays,
                dto.getReason(),
                isHalfDay,
                halfDayPeriod
        );

        LeaveRequest saved = leaveRepository.save(leaveRequest);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveResponseDTO> getMyLeaves(String employeeEmail) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        return leaveRepository.findByEmployeeIdOrderByAppliedAtDesc(employee.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeaveResponseDTO> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByAppliedAtDesc(LeaveStatus.PENDING)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeaveResponseDTO> getAllLeaves() {
        return leaveRepository.findAllByOrderByAppliedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public LeaveResponseDTO approveLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + leaveId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request #" + leaveId + " has already been " + leaveRequest.getStatus().name().toLowerCase());
        }

        Employee employee = leaveRequest.getEmployee();

        if (employee.getAvailableLeaveDays() < leaveRequest.getNumberOfDays()) {
            throw new BadRequestException("Cannot approve: Employee currently only has "
                    + employee.getAvailableLeaveDays() + " leave days left, but this request requires "
                    + leaveRequest.getNumberOfDays() + " days.");
        }

        // Deduct leave balance upon approval
        employee.setAvailableLeaveDays(employee.getAvailableLeaveDays() - leaveRequest.getNumberOfDays());
        employeeRepository.save(employee);

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        LeaveRequest updated = leaveRepository.save(leaveRequest);

        return mapToDTO(updated);
    }

    @Transactional
    public LeaveResponseDTO rejectLeave(Long leaveId, String rejectionReason) {
        LeaveRequest leaveRequest = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + leaveId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request #" + leaveId + " has already been " + leaveRequest.getStatus().name().toLowerCase());
        }

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setRejectionReason(rejectionReason != null && !rejectionReason.trim().isEmpty() 
                ? rejectionReason.trim() 
                : "Rejected by manager without specific comment");

        LeaveRequest updated = leaveRepository.save(leaveRequest);
        return mapToDTO(updated);
    }

    @Transactional
    public LeaveResponseDTO cancelLeave(Long leaveId, String employeeEmail) {
        LeaveRequest leaveRequest = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + leaveId));

        if (!leaveRequest.getEmployee().getEmail().equalsIgnoreCase(employeeEmail)) {
            throw new BadRequestException("You can only cancel your own leave requests");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING leave requests can be cancelled. Current status: " + leaveRequest.getStatus());
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        LeaveRequest updated = leaveRepository.save(leaveRequest);

        return mapToDTO(updated);
    }

    private LeaveResponseDTO mapToDTO(LeaveRequest leave) {
        Employee emp = leave.getEmployee();
        return new LeaveResponseDTO(
                leave.getId(),
                emp != null ? emp.getId() : null,
                emp != null ? emp.getFullName() : "Unknown",
                emp != null ? emp.getEmail() : null,
                emp != null ? emp.getDepartment() : null,
                leave.getLeaveType(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getNumberOfDays(),
                leave.getIsHalfDay(),
                leave.getHalfDayPeriod(),
                leave.getReason(),
                leave.getRejectionReason(),
                leave.getStatus(),
                leave.getAppliedAt()
        );
    }
}
