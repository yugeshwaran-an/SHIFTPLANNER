package com.shiftplanner.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "shifts")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Shift date is required")
    @Column(nullable = false)
    private LocalDate shiftDate;

    @NotNull(message = "Start time is required")
    @Column(nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(nullable = false)
    private LocalTime endTime;

    @NotBlank(message = "Shift type is required")
    @Column(nullable = false)
    private String shiftType; // e.g., Morning, Evening, Night

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    public Shift() {
    }

    public Shift(Long id, LocalDate shiftDate, LocalTime startTime, LocalTime endTime, String shiftType, String location) {
        this.id = id;
        this.shiftDate = shiftDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.shiftType = shiftType;
        this.location = location;
    }

    public Shift(LocalDate shiftDate, LocalTime startTime, LocalTime endTime, String shiftType, String location) {
        this.shiftDate = shiftDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.shiftType = shiftType;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
