package com.workforce360.service;

import com.workforce360.config.JwtUtil;
import com.workforce360.dto.AuthResponse;
import com.workforce360.dto.LoginRequest;
import com.workforce360.dto.RegisterRequest;
import com.workforce360.entity.Employee;
import com.workforce360.exception.BadRequestException;
import com.workforce360.exception.DuplicateRecordException;
import com.workforce360.exception.ResourceNotFoundException;
import com.workforce360.repository.EmployeeRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateRecordException("Email '" + request.getEmail() + "' is already registered");
        }

        Employee employee = new Employee();
        employee.setFullName(request.getFullName().trim());
        employee.setEmail(request.getEmail().trim().toLowerCase());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setRole(request.getRole());
        employee.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : "General");
        employee.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : "Associate");
        employee.setAvailableLeaveDays(18.0);

        Employee saved = employeeRepository.save(employee);
        String token = jwtUtil.generateToken(saved);

        return new AuthResponse(
                token,
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole(),
                saved.getDepartment(),
                saved.getDesignation(),
                saved.getAvailableLeaveDays()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Perform authentication
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        String token = jwtUtil.generateToken(employee);

        return new AuthResponse(
                token,
                employee.getId(),
                employee.getFullName(),
                employee.getEmail(),
                employee.getRole(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getAvailableLeaveDays()
        );
    }
}

