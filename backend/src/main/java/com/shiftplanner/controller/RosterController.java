package com.shiftplanner.controller;

import com.shiftplanner.dto.RosterRequest;
import com.shiftplanner.entity.Roster;
import com.shiftplanner.service.RosterService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rosters")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class RosterController {

    private final RosterService rosterService;

    public RosterController(RosterService rosterService) {
        this.rosterService = rosterService;
    }

    @PostMapping
    public ResponseEntity<Roster> createRoster(@Valid @RequestBody RosterRequest request) {
        Roster created = rosterService.createRoster(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Roster>> getAllRosters() {
        return ResponseEntity.ok(rosterService.getAllRosters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Roster> getRosterById(@PathVariable Long id) {
        return ResponseEntity.ok(rosterService.getRosterById(id));
    }

    @GetMapping("/week/{weekStartDate}")
    public ResponseEntity<List<Roster>> getRostersByWeek(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate) {
        return ResponseEntity.ok(rosterService.getRostersByWeek(weekStartDate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Roster> updateRoster(@PathVariable Long id, @Valid @RequestBody RosterRequest request) {
        return ResponseEntity.ok(rosterService.updateRoster(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoster(@PathVariable Long id) {
        rosterService.deleteRoster(id);
        return ResponseEntity.noContent().build();
    }
}
