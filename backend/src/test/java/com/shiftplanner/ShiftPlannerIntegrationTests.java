package com.shiftplanner;

import com.shiftplanner.dto.EmployeeRequest;
import com.shiftplanner.dto.RosterRequest;
import com.shiftplanner.dto.ShiftRequest;
import com.shiftplanner.dto.SwapRequestRequest;
import com.shiftplanner.entity.Employee;
import com.shiftplanner.entity.Roster;
import com.shiftplanner.entity.Shift;
import com.shiftplanner.entity.SwapRequest;
import com.shiftplanner.enums.EmployeeRole;
import com.shiftplanner.enums.RosterStatus;
import com.shiftplanner.enums.SwapStatus;
import com.shiftplanner.exception.BusinessRuleException;
import com.shiftplanner.service.EmployeeService;
import com.shiftplanner.service.RosterService;
import com.shiftplanner.service.ShiftService;
import com.shiftplanner.service.SwapRequestService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ShiftPlannerIntegrationTests {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private RosterService rosterService;

    @Autowired
    private SwapRequestService swapRequestService;

    @Test
    @DisplayName("RULE 2: Overlapping shifts on the same day must be rejected with exact error message")
    void testOverlappingShiftPrevention() {
        // 1. Create an employee
        Employee employee = employeeService.createEmployee(
                new EmployeeRequest("Kavita", "kavita.test@shiftplanner.com", EmployeeRole.EMPLOYEE, true)
        );

        LocalDate date = LocalDate.of(2026, 11, 2);

        // 2. Create Shift A: 09:00 - 17:00
        Shift shiftA = shiftService.createShift(
                new ShiftRequest(date, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Station A")
        );

        // 3. Create Shift B: 14:00 - 22:00 (overlaps with 09:00 - 17:00)
        Shift shiftB = shiftService.createShift(
                new ShiftRequest(date, LocalTime.of(14, 0), LocalTime.of(22, 0), "Evening", "Station B")
        );

        // 4. Assign Shift A to Kavita -> Should succeed
        Roster rosterA = rosterService.createRoster(
                new RosterRequest(date, employee.getId(), shiftA.getId(), RosterStatus.ASSIGNED)
        );
        assertNotNull(rosterA.getId());

        // 5. Attempt to assign Shift B to Kavita -> Must throw BusinessRuleException
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> {
            rosterService.createRoster(
                    new RosterRequest(date, employee.getId(), shiftB.getId(), RosterStatus.ASSIGNED)
            );
        });

        assertEquals("Employee already has an overlapping shift on this date.", ex.getMessage());
    }

    @Test
    @DisplayName("RULES 1, 4, 5, 6, 7: Swap request requires both approvals before modifying roster")
    void testShiftSwapWorkflowAndRules() {
        LocalDate date1 = LocalDate.of(2026, 11, 9);
        LocalDate date2 = LocalDate.of(2026, 11, 10);

        // Create two employees
        Employee empA = employeeService.createEmployee(
                new EmployeeRequest("Staff A", "staff.a@shiftplanner.com", EmployeeRole.EMPLOYEE, true)
        );
        Employee empB = employeeService.createEmployee(
                new EmployeeRequest("Staff B", "staff.b@shiftplanner.com", EmployeeRole.EMPLOYEE, true)
        );

        // Create two distinct shifts on different dates
        Shift shift1 = shiftService.createShift(
                new ShiftRequest(date1, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Area 1")
        );
        Shift shift2 = shiftService.createShift(
                new ShiftRequest(date2, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Area 2")
        );

        // Assign rosters
        Roster rosterA = rosterService.createRoster(
                new RosterRequest(date1, empA.getId(), shift1.getId(), RosterStatus.ASSIGNED)
        );
        Roster rosterB = rosterService.createRoster(
                new RosterRequest(date1, empB.getId(), shift2.getId(), RosterStatus.ASSIGNED)
        );

        // Create Swap Request: Staff A wants to trade with Staff B
        SwapRequest initialSwap = swapRequestService.createSwapRequest(
                new SwapRequestRequest(empA.getId(), empB.getId(), rosterA.getId(), rosterB.getId(), "Doctor appointment")
        );

        final Long swapId = initialSwap.getId();

        // RULE 4: Pending swap must NEVER modify the roster
        assertEquals(SwapStatus.PENDING, initialSwap.getStatus());
        assertFalse(initialSwap.isColleagueApproved());
        assertFalse(initialSwap.isManagerApproved());
        assertEquals(shift1.getId(), rosterService.getRosterById(rosterA.getId()).getShift().getId());
        assertEquals(shift2.getId(), rosterService.getRosterById(rosterB.getId()).getShift().getId());

        // RULE 7: Only the designated colleague (empB) can approve as colleague
        assertThrows(BusinessRuleException.class, () -> {
            swapRequestService.colleagueApprove(swapId, 99999L); // wrong employee ID
        });

        // Colleague approves
        SwapRequest colleagueApprovedSwap = swapRequestService.colleagueApprove(swapId, empB.getId());
        assertTrue(colleagueApprovedSwap.isColleagueApproved());
        assertFalse(colleagueApprovedSwap.isManagerApproved());

        // RULE 6: Colleague approval alone must not complete swap or modify roster
        assertEquals(SwapStatus.COLLEAGUE_APPROVED, colleagueApprovedSwap.getStatus());
        assertEquals(shift1.getId(), rosterService.getRosterById(rosterA.getId()).getShift().getId());
        assertEquals(shift2.getId(), rosterService.getRosterById(rosterB.getId()).getShift().getId());

        // Manager approves -> Now BOTH are true (RULE 1)
        SwapRequest completedSwap = swapRequestService.managerApprove(swapId);
        assertEquals(SwapStatus.COMPLETED, completedSwap.getStatus());
        assertTrue(completedSwap.isColleagueApproved());
        assertTrue(completedSwap.isManagerApproved());
        assertNotNull(completedSwap.getApprovedAt());

        // Verify roster changed: Shift 1 and Shift 2 are exchanged!
        Roster updatedRosterA = rosterService.getRosterById(rosterA.getId());
        Roster updatedRosterB = rosterService.getRosterById(rosterB.getId());
        assertEquals(shift2.getId(), updatedRosterA.getShift().getId());
        assertEquals(shift1.getId(), updatedRosterB.getShift().getId());
        assertEquals(RosterStatus.SWAPPED, updatedRosterA.getStatus());
        assertEquals(RosterStatus.SWAPPED, updatedRosterB.getStatus());
    }

    @Test
    @DisplayName("RULE 3: Rejected swap requests must never modify the roster")
    void testRejectedSwapDoesNotModifyRoster() {
        LocalDate date1 = LocalDate.of(2026, 11, 16);
        LocalDate date2 = LocalDate.of(2026, 11, 17);

        Employee empA = employeeService.createEmployee(
                new EmployeeRequest("Staff C", "staff.c@shiftplanner.com", EmployeeRole.EMPLOYEE, true)
        );
        Employee empB = employeeService.createEmployee(
                new EmployeeRequest("Staff D", "staff.d@shiftplanner.com", EmployeeRole.EMPLOYEE, true)
        );

        Shift shift1 = shiftService.createShift(
                new ShiftRequest(date1, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Area 1")
        );
        Shift shift2 = shiftService.createShift(
                new ShiftRequest(date2, LocalTime.of(14, 0), LocalTime.of(22, 0), "Evening", "Area 2")
        );

        Roster rosterA = rosterService.createRoster(
                new RosterRequest(date1, empA.getId(), shift1.getId(), RosterStatus.ASSIGNED)
        );
        Roster rosterB = rosterService.createRoster(
                new RosterRequest(date1, empB.getId(), shift2.getId(), RosterStatus.ASSIGNED)
        );

        SwapRequest swap = swapRequestService.createSwapRequest(
                new SwapRequestRequest(empA.getId(), empB.getId(), rosterA.getId(), rosterB.getId(), "Family event")
        );

        // Colleague rejects
        swap = swapRequestService.colleagueReject(swap.getId(), empB.getId());
        assertEquals(SwapStatus.REJECTED, swap.getStatus());
        assertFalse(swap.isColleagueApproved());

        // Verify roster remains strictly unchanged
        Roster verifyA = rosterService.getRosterById(rosterA.getId());
        Roster verifyB = rosterService.getRosterById(rosterB.getId());
        assertEquals(shift1.getId(), verifyA.getShift().getId());
        assertEquals(shift2.getId(), verifyB.getShift().getId());
        assertEquals(RosterStatus.ASSIGNED, verifyA.getStatus());
        assertEquals(RosterStatus.ASSIGNED, verifyB.getStatus());
    }
}
