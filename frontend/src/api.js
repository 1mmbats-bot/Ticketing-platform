const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.detail) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  health: () => request("/health"),

  listUsers: () => request("/users"),
  createUser: (body) => request("/users", { method: "POST", body: JSON.stringify(body) }),

  stats: () => request("/tickets/stats"),

  listTickets: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) q.append(k, v);
    });
    const qs = q.toString();
    return request("/tickets" + (qs ? `?${qs}` : ""));
  },
  getTicket: (id) => request(`/tickets/${id}`),
  createTicket: (body) => request("/tickets", { method: "POST", body: JSON.stringify(body) }),
  updateTicket: (id, body) =>
    request(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTicket: (id) => request(`/tickets/${id}`, { method: "DELETE" }),
  addComment: (id, body) =>
    request(`/tickets/${id}/comments`, { method: "POST", body: JSON.stringify(body) }),
};
