/**
 * SHIFTPLANNER - API Service Layer
 * Communicates with Spring Boot backend at http://localhost:8080/api
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Helper to process HTTP responses and handle Spring Boot error payloads
 */
async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (data && typeof data === 'object') {
      errorMsg = data.message || data.error || JSON.stringify(data);
    } else if (typeof data === 'string' && data.length > 0) {
      errorMsg = data;
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ==========================================================
// EMPLOYEE APIs
// ==========================================================
export const EmployeeAPI = {
  getAll: () => fetch(`${API_BASE_URL}/employees`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE_URL}/employees/${id}`).then(handleResponse),
  create: (data) =>
    fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  update: (id, data) =>
    fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  delete: (id) =>
    fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  toggleActive: (id) =>
    fetch(`${API_BASE_URL}/employees/${id}/toggle-active`, {
      method: 'PATCH',
    }).then(handleResponse),
};

// ==========================================================
// SHIFT APIs
// ==========================================================
export const ShiftAPI = {
  getAll: () => fetch(`${API_BASE_URL}/shifts`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE_URL}/shifts/${id}`).then(handleResponse),
  create: (data) =>
    fetch(`${API_BASE_URL}/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  update: (id, data) =>
    fetch(`${API_BASE_URL}/shifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  delete: (id) =>
    fetch(`${API_BASE_URL}/shifts/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};

// ==========================================================
// WEEKLY ROSTER APIs
// ==========================================================
export const RosterAPI = {
  getAll: () => fetch(`${API_BASE_URL}/rosters`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE_URL}/rosters/${id}`).then(handleResponse),
  getByWeek: (weekStartDate) =>
    fetch(`${API_BASE_URL}/rosters/week/${weekStartDate}`).then(handleResponse),
  create: (data) =>
    fetch(`${API_BASE_URL}/rosters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  update: (id, data) =>
    fetch(`${API_BASE_URL}/rosters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  delete: (id) =>
    fetch(`${API_BASE_URL}/rosters/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};

// ==========================================================
// SHIFT SWAP REQUEST APIs
// ==========================================================
export const SwapAPI = {
  getAll: () => fetch(`${API_BASE_URL}/swaps`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE_URL}/swaps/${id}`).then(handleResponse),
  getByEmployee: (employeeId) =>
    fetch(`${API_BASE_URL}/swaps/employee/${employeeId}`).then(handleResponse),
  create: (data) =>
    fetch(`${API_BASE_URL}/swaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  colleagueApprove: (id, employeeId) => {
    const url = employeeId
      ? `${API_BASE_URL}/swaps/${id}/colleague-approve?employeeId=${employeeId}`
      : `${API_BASE_URL}/swaps/${id}/colleague-approve`;
    return fetch(url, { method: 'PUT' }).then(handleResponse);
  },
  colleagueReject: (id, employeeId) => {
    const url = employeeId
      ? `${API_BASE_URL}/swaps/${id}/colleague-reject?employeeId=${employeeId}`
      : `${API_BASE_URL}/swaps/${id}/colleague-reject`;
    return fetch(url, { method: 'PUT' }).then(handleResponse);
  },
  managerApprove: (id) =>
    fetch(`${API_BASE_URL}/swaps/${id}/manager-approve`, {
      method: 'PUT',
    }).then(handleResponse),
  managerReject: (id) =>
    fetch(`${API_BASE_URL}/swaps/${id}/manager-reject`, {
      method: 'PUT',
    }).then(handleResponse),
};
