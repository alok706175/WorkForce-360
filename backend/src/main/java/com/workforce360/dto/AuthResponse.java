package com.workforce360.dto;

import com.workforce360.entity.Role;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String department;
    private String designation;
    private Double availableLeaveDays;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String fullName, String email, Role role, String department, String designation, Double availableLeaveDays) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.department = department;
        this.designation = designation;
        this.availableLeaveDays = availableLeaveDays;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Double getAvailableLeaveDays() {
        return availableLeaveDays;
    }

    public void setAvailableLeaveDays(Double availableLeaveDays) {
        this.availableLeaveDays = availableLeaveDays;
    }
}
