package com.shiftplanner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SwapRequestRequest {

    @NotNull(message = "Requester employee ID is required")
    @Positive(message = "Requester ID must be a positive number")
    private Long requesterId;

    @NotNull(message = "Colleague employee ID is required")
    @Positive(message = "Colleague ID must be a positive number")
    private Long colleagueId;

    @NotNull(message = "Requester roster ID is required")
    @Positive(message = "Requester roster ID must be a positive number")
    private Long requesterRosterId;

    @NotNull(message = "Colleague roster ID is required")
    @Positive(message = "Colleague roster ID must be a positive number")
    private Long colleagueRosterId;

    @NotBlank(message = "Reason for swap request is required")
    private String reason;

    public SwapRequestRequest() {
    }

    public SwapRequestRequest(Long requesterId, Long colleagueId, Long requesterRosterId, Long colleagueRosterId, String reason) {
        this.requesterId = requesterId;
        this.colleagueId = colleagueId;
        this.requesterRosterId = requesterRosterId;
        this.colleagueRosterId = colleagueRosterId;
        this.reason = reason;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public Long getColleagueId() {
        return colleagueId;
    }

    public void setColleagueId(Long colleagueId) {
        this.colleagueId = colleagueId;
    }

    public Long getRequesterRosterId() {
        return requesterRosterId;
    }

    public void setRequesterRosterId(Long requesterRosterId) {
        this.requesterRosterId = requesterRosterId;
    }

    public Long getColleagueRosterId() {
        return colleagueRosterId;
    }

    public void setColleagueRosterId(Long colleagueRosterId) {
        this.colleagueRosterId = colleagueRosterId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
