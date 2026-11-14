package com.workforce360.service;

import com.workforce360.dto.AttendanceDTO;
import com.workforce360.dto.AttendanceResponseDTO;
import com.workforce360.entity.Attendance;
import com.workforce360.entity.AttendanceStatus;
import com.workforce360.entity.Employee;
import com.workforce360.exception.BadRequestException;
import com.workforce360.exception.DuplicateRecordException;
import com.workforce360.exception.ResourceNotFoundException;
import com.workforce360.repository.AttendanceRepository;
import com.workforce360.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public AttendanceResponseDTO checkIn(String employeeEmail) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        LocalDate today = LocalDate.now();

        if (attendanceRepository.existsByEmployeeIdAndDate(employee.getId(), today)) {
            Attendance existing = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today).get();
            throw new DuplicateRecordException("You have already checked in today at " + 
                    (existing.getCheckInTime() != null ? existing.getCheckInTime() : "start of day"));
        }

        LocalTime now = LocalTime.now();
        Attendance attendance = new Attendance(employee, today, AttendanceStatus.PRESENT, now);
        Attendance saved = attendanceRepository.save(attendance);

        return mapToDTO(saved);
    }

    @Transactional
    public AttendanceResponseDTO checkOut(String employeeEmail) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new BadRequestException("You must check in first before checking out!"));

        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("You have already checked out today at " + attendance.getCheckOutTime());
        }

        LocalTime checkOutTime = LocalTime.now();
        attendance.setCheckOutTime(checkOutTime);

        if (attendance.getCheckInTime() != null) {
            long seconds = Duration.between(attendance.getCheckInTime(), checkOutTime).getSeconds();
            double hours = Math.round((seconds / 3600.0) * 100.0) / 100.0;
            attendance.setTotalHours(Math.max(0.0, hours));
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDTO(saved);
    }

    @Transactional
    public AttendanceResponseDTO markAttendance(String employeeEmail, AttendanceDTO dto) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        LocalDate targetDate = dto.getDate() != null ? dto.getDate() : LocalDate.now();

        if (targetDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Cannot mark attendance for a future date: " + targetDate);
        }

        if (attendanceRepository.existsByEmployeeIdAndDate(employee.getId(), targetDate)) {
            throw new DuplicateRecordException("Attendance has already been marked for " + targetDate);
        }

        Attendance attendance = new Attendance(employee, targetDate, dto.getStatus());
        if (dto.getStatus() == AttendanceStatus.PRESENT) {
            attendance.setCheckInTime(dto.getCheckInTime() != null ? dto.getCheckInTime() : LocalTime.now());
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getMyAttendance(String employeeEmail) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        return attendanceRepository.findByEmployeeIdOrderByDateDesc(employee.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAllAttendance(LocalDate date) {
        List<Attendance> list;
        if (date != null) {
            list = attendanceRepository.findByDateOrderByEmployeeFullNameAsc(date);
        } else {
            list = attendanceRepository.findAllByOrderByDateDesc();
        }
        return list.stream().map(this::mapToDTO).toList();
    }

    private AttendanceResponseDTO mapToDTO(Attendance att) {
        Employee emp = att.getEmployee();
        return new AttendanceResponseDTO(
                att.getId(),
                emp != null ? emp.getId() : null,
                emp != null ? emp.getFullName() : "Unknown",
                emp != null ? emp.getEmail() : null,
                emp != null ? emp.getDepartment() : null,
                att.getDate(),
                att.getStatus(),
                att.getCheckInTime(),
                att.getCheckOutTime(),
                att.getTotalHours()
        );
    }
}
