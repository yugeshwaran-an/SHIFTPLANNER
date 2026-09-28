package com.shiftplanner.service;

import com.shiftplanner.dto.SwapRequestRequest;
import com.shiftplanner.entity.Employee;
import com.shiftplanner.entity.Roster;
import com.shiftplanner.entity.Shift;
import com.shiftplanner.entity.SwapRequest;
import com.shiftplanner.enums.RosterStatus;
import com.shiftplanner.enums.SwapStatus;
import com.shiftplanner.exception.BusinessRuleException;
import com.shiftplanner.exception.InvalidSwapException;
import com.shiftplanner.exception.ResourceNotFoundException;
import com.shiftplanner.repository.EmployeeRepository;
import com.shiftplanner.repository.RosterRepository;
import com.shiftplanner.repository.SwapRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SwapRequestService {

    private final SwapRequestRepository swapRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final RosterRepository rosterRepository;
    private final RosterService rosterService;

    public SwapRequestService(SwapRequestRepository swapRequestRepository,
                              EmployeeRepository employeeRepository,
                              RosterRepository rosterRepository,
                              RosterService rosterService) {
        this.swapRequestRepository = swapRequestRepository;
        this.employeeRepository = employeeRepository;
        this.rosterRepository = rosterRepository;
        this.rosterService = rosterService;
    }

    /**
     * Creates a new shift swap request.
     * Validates requester and colleague identity, ownership of rosters, and active status.
     */
    public SwapRequest createSwapRequest(SwapRequestRequest request) {
        if (request.getRequesterId().equals(request.getColleagueId())) {
            throw new InvalidSwapException("Requester and colleague cannot be the same employee.");
        }

        Employee requester = employeeRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Requester employee not found with id: " + request.getRequesterId()));

        Employee colleague = employeeRepository.findById(request.getColleagueId())
                .orElseThrow(() -> new ResourceNotFoundException("Colleague employee not found with id: " + request.getColleagueId()));

        if (!requester.isActive()) {
            throw new BusinessRuleException("Requester is inactive and cannot request shift swaps.");
        }

        if (!colleague.isActive()) {
            throw new BusinessRuleException("Colleague is inactive and cannot participate in shift swaps.");
        }

        Roster requesterRoster = rosterRepository.findById(request.getRequesterRosterId())
                .orElseThrow(() -> new ResourceNotFoundException("Requester roster assignment not found with id: " + request.getRequesterRosterId()));

        Roster colleagueRoster = rosterRepository.findById(request.getColleagueRosterId())
                .orElseThrow(() -> new ResourceNotFoundException("Colleague roster assignment not found with id: " + request.getColleagueRosterId()));

        if (!requesterRoster.getEmployee().getId().equals(requester.getId())) {
            throw new InvalidSwapException("The selected requester roster does not belong to employee " + requester.getName() + ".");
        }

        if (!colleagueRoster.getEmployee().getId().equals(colleague.getId())) {
            throw new InvalidSwapException("The selected colleague roster does not belong to colleague " + colleague.getName() + ".");
        }

        if (requesterRoster.getId().equals(colleagueRoster.getId())) {
            throw new InvalidSwapException("Cannot swap the same roster assignment.");
        }

        SwapRequest swapRequest = new SwapRequest();
        swapRequest.setRequester(requester);
        swapRequest.setColleague(colleague);
        swapRequest.setRequesterRoster(requesterRoster);
        swapRequest.setColleagueRoster(colleagueRoster);
        swapRequest.setReason(request.getReason().trim());
        swapRequest.setStatus(SwapStatus.PENDING);
        swapRequest.setColleagueApproved(false);
        swapRequest.setManagerApproved(false);
        swapRequest.setRequestedAt(LocalDateTime.now());

        return swapRequestRepository.save(swapRequest);
    }

    @Transactional(readOnly = true)
    public List<SwapRequest> getAllSwapRequests() {
        return swapRequestRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SwapRequest getSwapRequestById(Long id) {
        return swapRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<SwapRequest> getSwapRequestsByEmployee(Long employeeId) {
        return swapRequestRepository.findByEmployeeId(employeeId);
    }

    /**
     * RULE 5, 6, 7:
     * Colleague approves the swap request.
     * If employeeId is passed, RULE 7 is verified (only the colleague in the swap can approve).
     * If manager has also approved, the swap executes. Otherwise, roster is NOT modified.
     */
    public SwapRequest colleagueApprove(Long id, Long employeeId) {
        SwapRequest swap = getSwapRequestById(id);

        if (swap.getStatus() == SwapStatus.REJECTED || swap.getStatus() == SwapStatus.COMPLETED) {
            throw new BusinessRuleException("Cannot modify swap request that is already " + swap.getStatus() + ".");
        }

        // RULE 7: Only the employee involved in the swap should be able to approve as colleague
        if (employeeId != null && !swap.getColleague().getId().equals(employeeId)) {
            throw new BusinessRuleException("Only the designated colleague (" + swap.getColleague().getName() + ") can approve this swap request.");
        }

        swap.setColleagueApproved(true);

        // RULE 1: Swap takes effect only after BOTH colleague AND manager approval
        if (swap.isManagerApproved()) {
            executeRosterSwap(swap);
        } else {
            // RULE 6: Colleague approval alone must not complete a swap
            swap.setStatus(SwapStatus.COLLEAGUE_APPROVED);
        }

        return swapRequestRepository.save(swap);
    }

    /**
     * Colleague rejects the swap request.
     * RULE 3: Rejected swap requests must never modify the roster.
     */
    public SwapRequest colleagueReject(Long id, Long employeeId) {
        SwapRequest swap = getSwapRequestById(id);

        if (swap.getStatus() == SwapStatus.REJECTED || swap.getStatus() == SwapStatus.COMPLETED) {
            throw new BusinessRuleException("Cannot modify swap request that is already " + swap.getStatus() + ".");
        }

        // RULE 7
        if (employeeId != null && !swap.getColleague().getId().equals(employeeId)) {
            throw new BusinessRuleException("Only the designated colleague (" + swap.getColleague().getName() + ") can reject this swap request.");
        }

        swap.setColleagueApproved(false);
        swap.setStatus(SwapStatus.REJECTED);
        // RULE 3: Roster remains untouched

        return swapRequestRepository.save(swap);
    }

    /**
     * Manager approves the swap request.
     * RULE 5: Manager approval alone must not complete a swap.
     * RULE 1: If colleague is also approved, execute swap safely.
     */
    public SwapRequest managerApprove(Long id) {
        SwapRequest swap = getSwapRequestById(id);

        if (swap.getStatus() == SwapStatus.REJECTED || swap.getStatus() == SwapStatus.COMPLETED) {
            throw new BusinessRuleException("Cannot modify swap request that is already " + swap.getStatus() + ".");
        }

        swap.setManagerApproved(true);

        // RULE 1 & RULE 5
        if (swap.isColleagueApproved()) {
            executeRosterSwap(swap);
        } else {
            // Manager approved first, but colleague hasn't approved yet
            swap.setStatus(SwapStatus.MANAGER_APPROVED);
        }

        return swapRequestRepository.save(swap);
    }

    /**
     * Manager rejects the swap request.
     * RULE 3: Rejected swap requests must never modify the roster.
     */
    public SwapRequest managerReject(Long id) {
        SwapRequest swap = getSwapRequestById(id);

        if (swap.getStatus() == SwapStatus.REJECTED || swap.getStatus() == SwapStatus.COMPLETED) {
            throw new BusinessRuleException("Cannot modify swap request that is already " + swap.getStatus() + ".");
        }

        swap.setManagerApproved(false);
        swap.setStatus(SwapStatus.REJECTED);
        // RULE 3: Roster remains untouched

        return swapRequestRepository.save(swap);
    }

    /**
     * Helper method executed ONLY when both colleagueApproved = true and managerApproved = true.
     * Updates rosters and swap status within an atomic transaction.
     */
    private void executeRosterSwap(SwapRequest swap) {
        Roster requesterRoster = swap.getRequesterRoster();
        Roster colleagueRoster = swap.getColleagueRoster();

        Shift requesterShift = requesterRoster.getShift();
        Shift colleagueShift = colleagueRoster.getShift();

        // Check if requester would have an overlapping shift on the colleague shift's date
        rosterService.validateNoOverlappingShifts(swap.getRequester().getId(), colleagueShift, requesterRoster.getId());

        // Check if colleague would have an overlapping shift on the requester shift's date
        rosterService.validateNoOverlappingShifts(swap.getColleague().getId(), requesterShift, colleagueRoster.getId());

        // Perform the swap of shifts between the two rosters
        requesterRoster.setShift(colleagueShift);
        requesterRoster.setStatus(RosterStatus.SWAPPED);

        colleagueRoster.setShift(requesterShift);
        colleagueRoster.setStatus(RosterStatus.SWAPPED);

        rosterRepository.save(requesterRoster);
        rosterRepository.save(colleagueRoster);

        swap.setStatus(SwapStatus.COMPLETED);
        swap.setApprovedAt(LocalDateTime.now());
    }
}
