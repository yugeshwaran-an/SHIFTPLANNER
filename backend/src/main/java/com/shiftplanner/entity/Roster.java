package com.shiftplanner.entity;

import com.shiftplanner.enums.RosterStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "rosters")
public class Roster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Week start date is required")
    @Column(nullable = false)
    private LocalDate weekStartDate;

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull(message = "Shift is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @NotNull(message = "Roster status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RosterStatus status = RosterStatus.ASSIGNED;

    public Roster() {
    }

    public Roster(Long id, LocalDate weekStartDate, Employee employee, Shift shift, RosterStatus status) {
        this.id = id;
        this.weekStartDate = weekStartDate;
        this.employee = employee;
        this.shift = shift;
        this.status = status != null ? status : RosterStatus.ASSIGNED;
    }

    public Roster(LocalDate weekStartDate, Employee employee, Shift shift, RosterStatus status) {
        this.weekStartDate = weekStartDate;
        this.employee = employee;
        this.shift = shift;
        this.status = status != null ? status : RosterStatus.ASSIGNED;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(LocalDate weekStartDate) {
        this.weekStartDate = weekStartDate;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Shift getShift() {
        return shift;
    }

    public void setShift(Shift shift) {
        this.shift = shift;
    }

    public RosterStatus getStatus() {
        return status;
    }

    public void setStatus(RosterStatus status) {
        this.status = status;
    }
}
