package com.shiftplanner.entity;

import com.shiftplanner.enums.SwapStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "swap_requests")
public class SwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Requester employee is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    @NotNull(message = "Colleague employee is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "colleague_id", nullable = false)
    private Employee colleague;

    @NotNull(message = "Requester roster is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requester_roster_id", nullable = false)
    private Roster requesterRoster;

    @NotNull(message = "Colleague roster is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "colleague_roster_id", nullable = false)
    private Roster colleagueRoster;

    @NotBlank(message = "Reason for swap is required")
    @Column(nullable = false)
    private String reason;

    @NotNull(message = "Swap status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SwapStatus status = SwapStatus.PENDING;

    @Column(nullable = false)
    private boolean colleagueApproved = false;

    @Column(nullable = false)
    private boolean managerApproved = false;

    @Column(nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    private LocalDateTime approvedAt;

    public SwapRequest() {
    }

    public SwapRequest(Employee requester, Employee colleague, Roster requesterRoster, Roster colleagueRoster, String reason) {
        this.requester = requester;
        this.colleague = colleague;
        this.requesterRoster = requesterRoster;
        this.colleagueRoster = colleagueRoster;
        this.reason = reason;
        this.status = SwapStatus.PENDING;
        this.colleagueApproved = false;
        this.managerApproved = false;
        this.requestedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getRequester() {
        return requester;
    }

    public void setRequester(Employee requester) {
        this.requester = requester;
    }

    public Employee getColleague() {
        return colleague;
    }

    public void setColleague(Employee colleague) {
        this.colleague = colleague;
    }

    public Roster getRequesterRoster() {
        return requesterRoster;
    }

    public void setRequesterRoster(Roster requesterRoster) {
        this.requesterRoster = requesterRoster;
    }

    public Roster getColleagueRoster() {
        return colleagueRoster;
    }

    public void setColleagueRoster(Roster colleagueRoster) {
        this.colleagueRoster = colleagueRoster;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public SwapStatus getStatus() {
        return status;
    }

    public void setStatus(SwapStatus status) {
        this.status = status;
    }

    public boolean isColleagueApproved() {
        return colleagueApproved;
    }

    public void setColleagueApproved(boolean colleagueApproved) {
        this.colleagueApproved = colleagueApproved;
    }

    public boolean isManagerApproved() {
        return managerApproved;
    }

    public void setManagerApproved(boolean managerApproved) {
        this.managerApproved = managerApproved;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
}
