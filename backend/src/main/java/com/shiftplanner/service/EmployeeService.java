package com.shiftplanner.service;

import com.shiftplanner.dto.EmployeeRequest;
import com.shiftplanner.entity.Employee;
import com.shiftplanner.exception.BusinessRuleException;
import com.shiftplanner.exception.ResourceNotFoundException;
import com.shiftplanner.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("An employee with email '" + request.getEmail() + "' already exists.");
        }

        Employee employee = new Employee();
        employee.setName(request.getName().trim());
        employee.setEmail(request.getEmail().trim().toLowerCase());
        employee.setRole(request.getRole());
        employee.setActive(request.getActive() != null ? request.getActive() : true);

        return employeeRepository.save(employee);
    }

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public Employee updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = getEmployeeById(id);

        if (!employee.getEmail().equalsIgnoreCase(request.getEmail().trim())
                && employeeRepository.existsByEmail(request.getEmail().trim())) {
            throw new BusinessRuleException("An employee with email '" + request.getEmail() + "' already exists.");
        }

        employee.setName(request.getName().trim());
        employee.setEmail(request.getEmail().trim().toLowerCase());
        employee.setRole(request.getRole());
        if (request.getActive() != null) {
            employee.setActive(request.getActive());
        }

        return employeeRepository.save(employee);
    }

    public Employee toggleEmployeeActive(Long id) {
        Employee employee = getEmployeeById(id);
        employee.setActive(!employee.isActive());
        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        // Soft deactivate to maintain integrity of historical shift rosters and swaps
        employee.setActive(false);
        employeeRepository.save(employee);
    }
}
