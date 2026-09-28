package com.shiftplanner.service;

import com.shiftplanner.dto.RosterRequest;
import com.shiftplanner.entity.Employee;
import com.shiftplanner.entity.Roster;
import com.shiftplanner.entity.Shift;
import com.shiftplanner.enums.RosterStatus;
import com.shiftplanner.exception.BusinessRuleException;
import com.shiftplanner.exception.ResourceNotFoundException;
import com.shiftplanner.repository.EmployeeRepository;
import com.shiftplanner.repository.RosterRepository;
import com.shiftplanner.repository.ShiftRepository;
import com.shiftplanner.repository.SwapRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class RosterService {

    private final RosterRepository rosterRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final SwapRequestRepository swapRequestRepository;

    public RosterService(RosterRepository rosterRepository,
                         EmployeeRepository employeeRepository,
                         ShiftRepository shiftRepository,
                         SwapRequestRepository swapRequestRepository) {
        this.rosterRepository = rosterRepository;
        this.employeeRepository = employeeRepository;
        this.shiftRepository = shiftRepository;
        this.swapRequestRepository = swapRequestRepository;
    }

    public Roster createRoster(RosterRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        if (!employee.isActive()) {
            throw new BusinessRuleException("Cannot assign shift to inactive employee: " + employee.getName());
        }

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + request.getShiftId()));

        // Check for overlapping shifts on the same date (RULE 2)
        validateNoOverlappingShifts(employee.getId(), shift, null);

        Roster roster = new Roster();
        roster.setWeekStartDate(request.getWeekStartDate());
        roster.setEmployee(employee);
        roster.setShift(shift);
        roster.setStatus(request.getStatus() != null ? request.getStatus() : RosterStatus.ASSIGNED);

        return rosterRepository.save(roster);
    }

    @Transactional(readOnly = true)
    public List<Roster> getAllRosters() {
        return rosterRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Roster getRosterById(Long id) {
        return rosterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roster assignment not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Roster> getRostersByWeek(LocalDate weekStartDate) {
        return rosterRepository.findByWeekStartDate(weekStartDate);
    }

    public Roster updateRoster(Long id, RosterRequest request) {
        Roster roster = getRosterById(id);

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        if (!employee.isActive()) {
            throw new BusinessRuleException("Cannot assign shift to inactive employee: " + employee.getName());
        }

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + request.getShiftId()));

        // Check for overlapping shifts on the same date excluding this roster
        validateNoOverlappingShifts(employee.getId(), shift, roster.getId());

        roster.setWeekStartDate(request.getWeekStartDate());
        roster.setEmployee(employee);
        roster.setShift(shift);
        if (request.getStatus() != null) {
            roster.setStatus(request.getStatus());
        }

        return rosterRepository.save(roster);
    }

    public void deleteRoster(Long id) {
        Roster roster = getRosterById(id);
        // Clean up or check if involved in pending swap requests
        if (!swapRequestRepository.findByRequesterRosterIdOrColleagueRosterId(id, id).isEmpty()) {
            throw new BusinessRuleException("Cannot delete roster because it is associated with shift swap requests.");
        }
        rosterRepository.delete(roster);
    }

    /**
     * BUSINESS RULE 2:
     * An employee cannot have two overlapping shifts on the same day.
     * Throws BusinessRuleException if overlap is detected.
     */
    public void validateNoOverlappingShifts(Long employeeId, Shift newShift, Long excludeRosterId) {
        List<Roster> existingRosters = rosterRepository.findByEmployeeIdAndShift_ShiftDate(employeeId, newShift.getShiftDate());

        for (Roster existing : existingRosters) {
            // Ignore current roster if updating
            if (excludeRosterId != null && existing.getId().equals(excludeRosterId)) {
                continue;
            }

            Shift assignedShift = existing.getShift();
            if (shiftsOverlap(newShift, assignedShift)) {
                throw new BusinessRuleException("Employee already has an overlapping shift on this date.");
            }
        }
    }

    /**
     * Checks if two time intervals [start1, end1] and [start2, end2] overlap.
     */
    public static boolean shiftsOverlap(Shift s1, Shift s2) {
        return s1.getStartTime().isBefore(s2.getEndTime()) && s1.getEndTime().isAfter(s2.getStartTime());
    }
}
