package com.workforce360.controller;

import com.workforce360.dto.ApiResponse;
import com.workforce360.dto.AttendanceDTO;
import com.workforce360.dto.AttendanceResponseDTO;
import com.workforce360.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceResponseDTO>> checkIn(Principal principal) {
        AttendanceResponseDTO response = attendanceService.checkIn(principal.getName());
        return new ResponseEntity<>(ApiResponse.ok("Checked in successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceResponseDTO>> checkOut(Principal principal) {
        AttendanceResponseDTO response = attendanceService.checkOut(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Checked out successfully", response));
    }

    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<AttendanceResponseDTO>> markAttendance(@Valid @RequestBody AttendanceDTO dto, Principal principal) {
        AttendanceResponseDTO response = attendanceService.markAttendance(principal.getName(), dto);
        return new ResponseEntity<>(ApiResponse.ok("Attendance marked successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AttendanceResponseDTO>>> getMyAttendance(Principal principal) {
        List<AttendanceResponseDTO> list = attendanceService.getMyAttendance(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Attendance history retrieved", list));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceResponseDTO>>> getAllAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceResponseDTO> list = attendanceService.getAllAttendance(date);
        return ResponseEntity.ok(ApiResponse.ok("Team attendance retrieved", list));
    }
}
