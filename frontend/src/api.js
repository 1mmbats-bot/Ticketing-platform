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

function qs(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) q.append(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  stats: () => request("/events/stats"),

  listEvents: (params = {}) => request("/events" + qs(params)),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (body) =>
    request("/events", { method: "POST", body: JSON.stringify(body) }),
  updateEvent: (id, body) =>
    request(`/events/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),

  createOrder: (body) =>
    request("/orders", { method: "POST", body: JSON.stringify(body) }),
  listOrders: (email) => request("/orders" + qs({ email })),
  getOrder: (code) => request(`/orders/${code}`),
  cancelOrder: (code) => request(`/orders/${code}/cancel`, { method: "POST" }),
  setPaymentStatus: (code, payment_status) =>
    request(`/orders/${code}`, {
      method: "PATCH",
      body: JSON.stringify({ payment_status }),
    }),
};
