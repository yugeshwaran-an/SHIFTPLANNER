package com.shiftplanner.repository;

import com.shiftplanner.entity.Employee;
import com.shiftplanner.entity.Roster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RosterRepository extends JpaRepository<Roster, Long> {
    List<Roster> findByWeekStartDate(LocalDate weekStartDate);
    List<Roster> findByEmployeeId(Long employeeId);
    List<Roster> findByEmployee(Employee employee);
    List<Roster> findByEmployeeIdAndShift_ShiftDate(Long employeeId, LocalDate shiftDate);
    List<Roster> findByShiftId(Long shiftId);
}
