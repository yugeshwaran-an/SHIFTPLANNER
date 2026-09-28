# SHIFTPLANNER – Employee Shift Roster and Swap Requests

> **Full-Stack Web Application** for retail and manufacturing organizations to manage weekly employee shift rosters, prevent overlapping schedule conflicts, and coordinate two-tier employee shift swap requests (Colleague Approval + Manager Authorization).

---

## 1. Project Overview

**SHIFTPLANNER** is an enterprise-grade yet beginner-friendly full-stack application built for small-to-medium retail and manufacturing businesses. It provides team managers with the ability to schedule operational shifts without double-booking employees, while empowering team members to trade shifts transparently with colleague and manager oversight.

---

## 2. Key Features & Business Rules

### Core Features
- **Employee Directory**: Manage staff members, email, system roles (`EMPLOYEE`, `MANAGER`), and active/inactive availability.
- **Shift Management**: Configure operational shift timings (Morning, Evening, Night) with start and end times and location/department tagging.
- **Weekly Roster**: Visual weekly schedule matrix displaying employee allocations, shift dates, start/end times, and roster status (`ASSIGNED`, `SWAPPED`).
- **Two-Tier Shift Swap Requests**:
  1. **Requester** submits swap proposal with another employee.
  2. **Colleague** approves or rejects the trade request.
  3. **Manager** provides final authorization.
  4. Both rosters exchange shifts atomically only upon both approvals!

### Enforced Business Rules
- **RULE 1**: A shift swap takes effect in the roster **ONLY** after BOTH colleague approval AND manager approval.
- **RULE 2 (Overlapping Shift Prevention)**: An employee cannot have two overlapping shifts on the same day. Example: If an employee already works `09:00 - 17:00`, the system will strictly reject an assignment to `14:00 - 22:00` with the exact message:  
  `"Employee already has an overlapping shift on this date."`
- **RULE 3**: Rejected swap requests must **never** modify the roster.
- **RULE 4**: Pending swap requests must **never** modify the roster.
- **RULE 5**: Manager approval alone must **not** complete a swap.
- **RULE 6**: Colleague approval alone must **not** complete a swap.
- **RULE 7**: Only the designated colleague involved in the swap request can approve or reject as the colleague.
- **Transactional Integrity**: Roster exchange and swap status updates are wrapped in `@Transactional` to guarantee ACID compliance.

---

## 3. Technology Stack

### Backend
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.3.4
- **Persistence**: Spring Data JPA / Hibernate 6
- **Validation**: Jakarta Validation (`@NotNull`, `@NotBlank`, `@Email`, `@Positive`)
- **Database**: MySQL 8+ (with in-memory H2 profile included for zero-setup demo)
- **Build Tool**: Apache Maven

### Frontend
- **Framework**: React 18
- **Tooling / Bundler**: Vite 5
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Modern custom design system with Outfit & Inter Google Fonts)
- **HTTP Client**: Fetch API with unified Spring Boot error translation

---

## 4. Database Setup (MySQL)

1. Open your MySQL CLI or MySQL Workbench:
   ```sql
   CREATE DATABASE IF NOT EXISTS shiftplanner_db;
   ```
2. In `backend/src/main/resources/application.properties`, update your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/shiftplanner_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
   *(Hibernate will automatically create all tables, foreign keys, and indexes on startup via `spring.jpa.hibernate.ddl-auto=update`)*

> **Zero-Setup Quick Demo (H2 In-Memory)**:  
> If MySQL is not installed locally on the evaluator's machine, you can run the backend with the pre-configured H2 in-memory profile:  
> `mvn spring-boot:run -Dspring-boot.run.profiles=h2`  
> In H2 mode, the console is available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:shiftplanner_db`, User: `sa`, Password: empty).

---

## 5. Sample Seed Data

The backend includes a `DataInitializer` that automatically seeds the database on first run with:
- **Employees**:
  - `Arun` (Role: `MANAGER`, Email: `arun@shiftplanner.com`)
  - `Priya` (Role: `EMPLOYEE`, Email: `priya@shiftplanner.com`)
  - `Rahul` (Role: `EMPLOYEE`, Email: `rahul@shiftplanner.com`)
  - `Divya` (Role: `EMPLOYEE`, Email: `divya@shiftplanner.com`)
- **Shifts**:
  - Morning: `09:00 - 17:00`
  - Evening: `14:00 - 22:00`
  - Night: `18:00 - 23:30`
- **Roster Assignments**: Seeded across Monday to Friday of the current week.
- **Sample Swap Request**: A pending request from Priya to swap Monday shift with Rahul's Tuesday shift.

---

## 6. How to Run the Project

### Prerequisites
- Java 17 or 21 installed (`java -version`)
- Maven installed (`mvn -version`)
- Node.js 18+ installed (`node -v`)

### Step 1: Start Backend (Spring Boot)
Open a terminal in the project directory:
```powershell
cd backend
mvn spring-boot:run
```
*The Spring Boot REST API will start at: `http://localhost:8080`*

### Step 2: Start Frontend (React + Vite)
Open a second terminal:
```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```
*The React UI will start at: `http://localhost:5173`*

---

## 7. API Endpoints

### Employees (`/api/employees`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/employees` | Add a new employee |
| `GET` | `/api/employees` | View all employees |
| `GET` | `/api/employees/{id}` | View employee by ID |
| `PUT` | `/api/employees/{id}` | Update employee details |
| `DELETE` | `/api/employees/{id}` | Deactivate employee |
| `PATCH` | `/api/employees/{id}/toggle-active` | Toggle active status |

### Shifts (`/api/shifts`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/shifts` | Create a shift |
| `GET` | `/api/shifts` | View all shifts |
| `GET` | `/api/shifts/{id}` | View shift by ID |
| `PUT` | `/api/shifts/{id}` | Update shift |
| `DELETE` | `/api/shifts/{id}` | Delete shift |

### Weekly Roster (`/api/rosters`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rosters` | Assign employee to shift (Validates Rule 2) |
| `GET` | `/api/rosters` | View all rosters |
| `GET` | `/api/rosters/{id}` | View roster by ID |
| `GET` | `/api/rosters/week/{weekStartDate}` | View rosters for a specific week |
| `PUT` | `/api/rosters/{id}` | Update roster assignment |
| `DELETE` | `/api/rosters/{id}` | Remove roster assignment |

### Swap Requests (`/api/swaps`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/swaps` | Submit a shift swap request |
| `GET` | `/api/swaps` | View all swap requests |
| `GET` | `/api/swaps/{id}` | View swap request by ID |
| `GET` | `/api/swaps/employee/{employeeId}` | View swaps involving an employee |
| `PUT` | `/api/swaps/{id}/colleague-approve` | Colleague approves swap request |
| `PUT` | `/api/swaps/{id}/colleague-reject` | Colleague rejects swap request |
| `PUT` | `/api/swaps/{id}/manager-approve` | Manager final approval (Triggers swap if colleague approved) |
| `PUT` | `/api/swaps/{id}/manager-reject` | Manager rejects swap request |

---

## 8. Sample JSON Requests & Responses

### 1. Assign Roster (`POST /api/rosters`)
```json
{
  "weekStartDate": "2026-10-05",
  "employeeId": 2,
  "shiftId": 1,
  "status": "ASSIGNED"
}
```

### 2. Overlapping Shift Error Response (`POST /api/rosters`)
If employee 2 is already working `09:00 - 17:00` and you assign `14:00 - 22:00`:
```json
{
  "timestamp": "2026-09-28T10:30:00",
  "status": 400,
  "error": "Business Rule Violation",
  "message": "Employee already has an overlapping shift on this date."
}
```

### 3. Create Swap Request (`POST /api/swaps`)
```json
{
  "requesterId": 2,
  "colleagueId": 3,
  "requesterRosterId": 2,
  "colleagueRosterId": 3,
  "reason": "Personal family emergency on Monday morning."
}
```

---

## 9. Testing Guide (Postman & Manual)

A ready-to-import Postman collection is included in the project:  
`ShiftPlanner.postman_collection.json`

### 10 Step Postman Test Verification:
1. **Create Employee**: `POST /api/employees` → Creates test employee.
2. **Create Shift**: `POST /api/shifts` → Creates a `09:00 - 17:00` shift.
3. **Assign Employee to Shift**: `POST /api/rosters` → Successfully assigns shift.
4. **Attempt Overlapping Shift**: `POST /api/rosters` with overlapping shift `14:00 - 22:00` on same date → Backend returns HTTP 400 `"Employee already has an overlapping shift on this date."`
5. **Create Swap Request**: `POST /api/swaps` → Status is `PENDING`. Roster remains unchanged.
6. **Colleague Approves**: `PUT /api/swaps/{id}/colleague-approve?employeeId=3` → Status is `COLLEAGUE_APPROVED`. Roster remains unchanged.
7. **Manager Approves**: `PUT /api/swaps/{id}/manager-approve` → Both approvals are now true.
8. **Verify Roster Changed**: `GET /api/rosters` → Both rosters have swapped their shifts and status updated to `SWAPPED`.
9. **Reject Swap**: `PUT /api/swaps/{id}/manager-reject` on a new request → Status is `REJECTED`.
10. **Verify Roster Did Not Change**: `GET /api/rosters` → Roster assignments remain untouched.

---

## 10. Project Structure

```
shiftplanner/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/shiftplanner/
│       │   │   ├── ShiftplannerApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java
│       │   │   │   └── DataInitializer.java
│       │   │   ├── controller/
│       │   │   │   ├── EmployeeController.java
│       │   │   │   ├── ShiftController.java
│       │   │   │   ├── RosterController.java
│       │   │   │   └── SwapRequestController.java
│       │   │   ├── dto/
│       │   │   │   ├── EmployeeRequest.java
│       │   │   │   ├── ShiftRequest.java
│       │   │   │   ├── RosterRequest.java
│       │   │   │   ├── SwapRequestRequest.java
│       │   │   │   └── ErrorResponse.java
│       │   │   ├── entity/
│       │   │   │   ├── Employee.java
│       │   │   │   ├── Shift.java
│       │   │   │   ├── Roster.java
│       │   │   │   └── SwapRequest.java
│       │   │   ├── enums/
│       │   │   │   ├── EmployeeRole.java
│       │   │   │   ├── RosterStatus.java
│       │   │   │   └── SwapStatus.java
│       │   │   ├── exception/
│       │   │   │   ├── BusinessRuleException.java
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   ├── InvalidSwapException.java
│       │   │   │   └── ResourceNotFoundException.java
│       │   │   ├── repository/
│       │   │   │   ├── EmployeeRepository.java
│       │   │   │   ├── ShiftRepository.java
│       │   │   │   ├── RosterRepository.java
│       │   │   │   └── SwapRequestRepository.java
│       │   │   └── service/
│       │   │       ├── EmployeeService.java
│       │   │       ├── ShiftService.java
│       │   │       ├── RosterService.java
│       │   │       └── SwapRequestService.java
│       │   └── resources/
│       │       ├── application.properties
│       │       └── application-h2.properties
│       └── test/
│           ├── java/com/shiftplanner/ShiftplannerApplicationTests.java
│           └── resources/application.properties
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Modal.jsx
│       │   ├── StatCard.jsx
│       │   └── AlertToast.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Employees.jsx
│       │   ├── Shifts.jsx
│       │   ├── WeeklyRoster.jsx
│       │   └── SwapRequests.jsx
│       └── services/
│           └── api.js
├── ShiftPlanner.postman_collection.json
└── README.md
```

---

## 11. College Project Evaluation Notes
- **Clean Architecture**: Strict separation of concerns (Controllers for REST, Services for Business Logic, Repositories for Data Access, DTOs for client request encapsulation).
- **Security & Integrity**: Bean validation on every inbound payload, unique database constraints on email, transaction boundaries on swaps, and shift overlap prevention.
- **Modern UI**: Polished glassmorphism, Outfit + Inter typography, status badges, week pickers, role simulation switcher, and toast notifications.
