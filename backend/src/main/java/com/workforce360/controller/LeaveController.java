package com.workforce360.controller;

import com.workforce360.dto.ApiResponse;
import com.workforce360.dto.LeaveApplyDTO;
import com.workforce360.dto.LeaveResponseDTO;
import com.workforce360.dto.RejectLeaveDTO;
import com.workforce360.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LeaveResponseDTO>> applyLeave(@Valid @RequestBody LeaveApplyDTO dto, Principal principal) {
        LeaveResponseDTO response = leaveService.applyLeave(principal.getName(), dto);
        return new ResponseEntity<>(ApiResponse.ok("Leave request submitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeaveResponseDTO>>> getMyLeaves(Principal principal) {
        List<LeaveResponseDTO> leaves = leaveService.getMyLeaves(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Leave history retrieved successfully", leaves));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveResponseDTO>> cancelLeave(@PathVariable Long id, Principal principal) {
        LeaveResponseDTO response = leaveService.cancelLeave(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Leave request cancelled successfully", response));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveResponseDTO>>> getPendingLeaves() {
        List<LeaveResponseDTO> leaves = leaveService.getPendingLeaves();
        return ResponseEntity.ok(ApiResponse.ok("Pending leave requests retrieved", leaves));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveResponseDTO>>> getAllLeaves() {
        List<LeaveResponseDTO> leaves = leaveService.getAllLeaves();
        return ResponseEntity.ok(ApiResponse.ok("All leave requests retrieved", leaves));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<LeaveResponseDTO>> approveLeave(@PathVariable Long id) {
        LeaveResponseDTO response = leaveService.approveLeave(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave request approved successfully", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<LeaveResponseDTO>> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) RejectLeaveDTO dto) {
        String reason = (dto != null) ? dto.getReason() : null;
        LeaveResponseDTO response = leaveService.rejectLeave(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Leave request rejected", response));
    }
}
