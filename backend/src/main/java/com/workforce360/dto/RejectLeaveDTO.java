package com.workforce360.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectLeaveDTO {

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    public RejectLeaveDTO() {
    }

    public RejectLeaveDTO(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
