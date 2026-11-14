package com.workforce360.controller;

import com.workforce360.dto.ApiResponse;
import com.workforce360.dto.EmployeeResponseDTO;
import com.workforce360.entity.Employee;
import com.workforce360.exception.ResourceNotFoundException;
import com.workforce360.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDTO>>> getAllEmployees() {
        List<EmployeeResponseDTO> employees = employeeRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Employees retrieved successfully", employees));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> getCurrentEmployee(Principal principal) {
        Employee employee = employeeRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + principal.getName()));

        return ResponseEntity.ok(ApiResponse.ok("Employee profile retrieved", mapToDTO(employee)));
    }

    private EmployeeResponseDTO mapToDTO(Employee emp) {
        return new EmployeeResponseDTO(
                emp.getId(),
                emp.getFullName(),
                emp.getEmail(),
                emp.getRole(),
                emp.getDepartment(),
                emp.getDesignation(),
                emp.getAvailableLeaveDays()
        );
    }
}

