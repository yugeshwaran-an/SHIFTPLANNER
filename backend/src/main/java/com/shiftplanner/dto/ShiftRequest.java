package com.shiftplanner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class ShiftRequest {

    @NotNull(message = "Shift date is required")
    private LocalDate shiftDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Shift type is required (e.g. Morning, Evening, Night)")
    private String shiftType;

    @NotBlank(message = "Location is required")
    private String location;

    public ShiftRequest() {
    }

    public ShiftRequest(LocalDate shiftDate, LocalTime startTime, LocalTime endTime, String shiftType, String location) {
        this.shiftDate = shiftDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.shiftType = shiftType;
        this.location = location;
    }

    public LocalDate getShiftDate() {
        return shiftDate;
    }

    public void setShiftDate(LocalDate shiftDate) {
        this.shiftDate = shiftDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getShiftType() {
        return shiftType;
    }

    public void setShiftType(String shiftType) {
        this.shiftType = shiftType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
