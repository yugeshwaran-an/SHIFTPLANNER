package com.shiftplanner.controller;

import com.shiftplanner.dto.SwapRequestRequest;
import com.shiftplanner.entity.SwapRequest;
import com.shiftplanner.service.SwapRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swaps")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SwapRequestController {

    private final SwapRequestService swapRequestService;

    public SwapRequestController(SwapRequestService swapRequestService) {
        this.swapRequestService = swapRequestService;
    }

    @PostMapping
    public ResponseEntity<SwapRequest> createSwapRequest(@Valid @RequestBody SwapRequestRequest request) {
        SwapRequest created = swapRequestService.createSwapRequest(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SwapRequest>> getAllSwapRequests() {
        return ResponseEntity.ok(swapRequestService.getAllSwapRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SwapRequest> getSwapRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(swapRequestService.getSwapRequestById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SwapRequest>> getSwapRequestsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(swapRequestService.getSwapRequestsByEmployee(employeeId));
    }

    @PutMapping("/{id}/colleague-approve")
    public ResponseEntity<SwapRequest> colleagueApprove(
            @PathVariable Long id,
            @RequestParam(required = false) Long employeeId) {
        return ResponseEntity.ok(swapRequestService.colleagueApprove(id, employeeId));
    }

    @PutMapping("/{id}/colleague-reject")
    public ResponseEntity<SwapRequest> colleagueReject(
            @PathVariable Long id,
            @RequestParam(required = false) Long employeeId) {
        return ResponseEntity.ok(swapRequestService.colleagueReject(id, employeeId));
    }

    @PutMapping("/{id}/manager-approve")
    public ResponseEntity<SwapRequest> managerApprove(@PathVariable Long id) {
        return ResponseEntity.ok(swapRequestService.managerApprove(id));
    }

    @PutMapping("/{id}/manager-reject")
    public ResponseEntity<SwapRequest> managerReject(@PathVariable Long id) {
        return ResponseEntity.ok(swapRequestService.managerReject(id));
    }
}
