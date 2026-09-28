package com.shiftplanner.service;

import com.shiftplanner.dto.ShiftRequest;
import com.shiftplanner.entity.Shift;
import com.shiftplanner.exception.BusinessRuleException;
import com.shiftplanner.exception.ResourceNotFoundException;
import com.shiftplanner.repository.RosterRepository;
import com.shiftplanner.repository.ShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final RosterRepository rosterRepository;

    public ShiftService(ShiftRepository shiftRepository, RosterRepository rosterRepository) {
        this.shiftRepository = shiftRepository;
        this.rosterRepository = rosterRepository;
    }

    public Shift createShift(ShiftRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessRuleException("Shift start time (" + request.getStartTime() + ") must be before end time (" + request.getEndTime() + ").");
        }

        Shift shift = new Shift();
        shift.setShiftDate(request.getShiftDate());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setShiftType(request.getShiftType().trim());
        shift.setLocation(request.getLocation().trim());

        return shiftRepository.save(shift);
    }

    @Transactional(readOnly = true)
    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Shift getShiftById(Long id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + id));
    }

    public Shift updateShift(Long id, ShiftRequest request) {
        Shift shift = getShiftById(id);

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BusinessRuleException("Shift start time (" + request.getStartTime() + ") must be before end time (" + request.getEndTime() + ").");
        }

        shift.setShiftDate(request.getShiftDate());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setShiftType(request.getShiftType().trim());
        shift.setLocation(request.getLocation().trim());

        return shiftRepository.save(shift);
    }

    public void deleteShift(Long id) {
        Shift shift = getShiftById(id);
        if (!rosterRepository.findByShiftId(id).isEmpty()) {
            throw new BusinessRuleException("Cannot delete shift because it is currently assigned in one or more rosters.");
        }
        shiftRepository.delete(shift);
    }
}
