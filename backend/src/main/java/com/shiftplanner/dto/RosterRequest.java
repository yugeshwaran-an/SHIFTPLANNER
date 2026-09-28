package com.shiftplanner.dto;

import com.shiftplanner.enums.RosterStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class RosterRequest {

    @NotNull(message = "Week start date is required")
    private LocalDate weekStartDate;

    @NotNull(message = "Employee ID is required")
    @Positive(message = "Employee ID must be a positive number")
    private Long employeeId;

    @NotNull(message = "Shift ID is required")
    @Positive(message = "Shift ID must be a positive number")
    private Long shiftId;

    private RosterStatus status = RosterStatus.ASSIGNED;

    public RosterRequest() {
    }

    public RosterRequest(LocalDate weekStartDate, Long employeeId, Long shiftId, RosterStatus status) {
        this.weekStartDate = weekStartDate;
        this.employeeId = employeeId;
        this.shiftId = shiftId;
        this.status = status != null ? status : RosterStatus.ASSIGNED;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(LocalDate weekStartDate) {
        this.weekStartDate = weekStartDate;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getShiftId() {
        return shiftId;
    }

    public void setShiftId(Long shiftId) {
        this.shiftId = shiftId;
    }

    public RosterStatus getStatus() {
        return status;
    }

    public void setStatus(RosterStatus status) {
        this.status = status;
    }
}
