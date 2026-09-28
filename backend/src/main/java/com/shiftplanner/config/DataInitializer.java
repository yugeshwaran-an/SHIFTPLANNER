package com.shiftplanner.config;

import com.shiftplanner.entity.Employee;
import com.shiftplanner.entity.Roster;
import com.shiftplanner.entity.Shift;
import com.shiftplanner.entity.SwapRequest;
import com.shiftplanner.enums.EmployeeRole;
import com.shiftplanner.enums.RosterStatus;
import com.shiftplanner.enums.SwapStatus;
import com.shiftplanner.repository.EmployeeRepository;
import com.shiftplanner.repository.RosterRepository;
import com.shiftplanner.repository.ShiftRepository;
import com.shiftplanner.repository.SwapRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final RosterRepository rosterRepository;
    private final SwapRequestRepository swapRequestRepository;

    public DataInitializer(EmployeeRepository employeeRepository,
                           ShiftRepository shiftRepository,
                           RosterRepository rosterRepository,
                           SwapRequestRepository swapRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.shiftRepository = shiftRepository;
        this.rosterRepository = rosterRepository;
        this.swapRequestRepository = swapRequestRepository;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) {
        try {
            if (employeeRepository.count() > 0) {
                log.info("Database already seeded with initial data.");
                return;
            }
        } catch (Exception e) {
            log.info("Initializing schema tables for first seed...");
        }

        log.info("Seeding ShiftPlanner initial sample data...");

        // 1. Seed Employees (Arun - Manager, Priya, Rahul, Divya - Employees)
        Employee arun = employeeRepository.save(new Employee("Arun", "arun@shiftplanner.com", EmployeeRole.MANAGER, true));
        Employee priya = employeeRepository.save(new Employee("Priya", "priya@shiftplanner.com", EmployeeRole.EMPLOYEE, true));
        Employee rahul = employeeRepository.save(new Employee("Rahul", "rahul@shiftplanner.com", EmployeeRole.EMPLOYEE, true));
        Employee divya = employeeRepository.save(new Employee("Divya", "divya@shiftplanner.com", EmployeeRole.EMPLOYEE, true));

        // Current week Monday
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate tuesday = monday.plusDays(1);
        LocalDate wednesday = monday.plusDays(2);
        LocalDate thursday = monday.plusDays(3);
        LocalDate friday = monday.plusDays(4);

        // 2. Seed Shifts
        Shift mondayMorning = shiftRepository.save(new Shift(monday, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Retail Store - Floor 1"));
        Shift mondayEvening = shiftRepository.save(new Shift(monday, LocalTime.of(14, 0), LocalTime.of(22, 0), "Evening", "Retail Store - Floor 1"));
        Shift mondayNight = shiftRepository.save(new Shift(monday, LocalTime.of(18, 0), LocalTime.of(23, 30), "Night", "Warehouse Dock"));

        Shift tuesdayMorning = shiftRepository.save(new Shift(tuesday, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Retail Store - Floor 2"));
        Shift tuesdayEvening = shiftRepository.save(new Shift(tuesday, LocalTime.of(14, 0), LocalTime.of(22, 0), "Evening", "Retail Store - Floor 2"));

        Shift wednesdayMorning = shiftRepository.save(new Shift(wednesday, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Retail Store - Floor 1"));
        Shift thursdayEvening = shiftRepository.save(new Shift(thursday, LocalTime.of(14, 0), LocalTime.of(22, 0), "Evening", "Retail Store - Floor 1"));
        Shift fridayMorning = shiftRepository.save(new Shift(friday, LocalTime.of(9, 0), LocalTime.of(17, 0), "Morning", "Assembly Unit 3"));

        // 3. Seed Weekly Rosters
        Roster r1 = rosterRepository.save(new Roster(monday, arun, mondayMorning, RosterStatus.ASSIGNED));
        Roster r2 = rosterRepository.save(new Roster(monday, priya, mondayMorning, RosterStatus.ASSIGNED));
        Roster r3 = rosterRepository.save(new Roster(monday, rahul, tuesdayMorning, RosterStatus.ASSIGNED));
        Roster r4 = rosterRepository.save(new Roster(monday, divya, tuesdayEvening, RosterStatus.ASSIGNED));
        Roster r5 = rosterRepository.save(new Roster(monday, priya, wednesdayMorning, RosterStatus.ASSIGNED));
        Roster r6 = rosterRepository.save(new Roster(monday, rahul, thursdayEvening, RosterStatus.ASSIGNED));
        Roster r7 = rosterRepository.save(new Roster(monday, divya, fridayMorning, RosterStatus.ASSIGNED));

        // 4. Seed a Sample Swap Request: Priya requests swap with Rahul
        SwapRequest sampleSwap = new SwapRequest();
        sampleSwap.setRequester(priya);
        sampleSwap.setColleague(rahul);
        sampleSwap.setRequesterRoster(r2); // Priya's Monday Morning Shift
        sampleSwap.setColleagueRoster(r3); // Rahul's Tuesday Morning Shift
        sampleSwap.setReason("Personal family event on Monday; able to cover Rahul on Tuesday.");
        sampleSwap.setStatus(SwapStatus.PENDING);
        sampleSwap.setColleagueApproved(false);
        sampleSwap.setManagerApproved(false);
        sampleSwap.setRequestedAt(LocalDateTime.now().minusHours(3));
        swapRequestRepository.save(sampleSwap);

        log.info("ShiftPlanner sample data successfully seeded!");
    }
}
