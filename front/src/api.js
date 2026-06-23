const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = payload.error?.details
      ?.map((item) => item.message)
      .join(" ");
    throw new Error(
      [payload.error?.message, details].filter(Boolean).join(" ") ||
        "Nepavyko įvykdyti užklausos.",
    );
  }

  return payload;
}

export const api = {
  getStudents(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== ""),
    );
    return request(`/students?${query}`);
  },
  getStudent(id) {
    return request(`/students/${id}`);
  },
  createStudent(data) {
    return request("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateStudent(id, data) {
    return request(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteStudent(id) {
    return request(`/students/${id}`, { method: "DELETE" });
  },
  createSubject(studentId, data) {
    return request(`/students/${studentId}/subjects`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateSubject(studentId, assignmentId, data) {
    return request(`/students/${studentId}/subjects/${assignmentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteSubject(studentId, assignmentId) {
    return request(`/students/${studentId}/subjects/${assignmentId}`, {
      method: "DELETE",
    });
  },
};

