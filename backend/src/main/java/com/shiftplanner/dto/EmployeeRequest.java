package com.shiftplanner.dto;

import com.shiftplanner.enums.EmployeeRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EmployeeRequest {

    @NotBlank(message = "Employee name cannot be blank")
    private String name;

    @NotBlank(message = "Employee email cannot be blank")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotNull(message = "Role is required (EMPLOYEE or MANAGER)")
    private EmployeeRole role;

    private Boolean active = true;

    public EmployeeRequest() {
    }

    public EmployeeRequest(String name, String email, EmployeeRole role, Boolean active) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active != null ? active : true;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public EmployeeRole getRole() {
        return role;
    }

    public void setRole(EmployeeRole role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
