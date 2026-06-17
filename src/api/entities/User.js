import { apiFetch } from '@/api/client';

// Roles: organizer | marketing_partner | exhibitor | attendee
// organizer and marketing_partner have console access

const BASE = '/api/users';

export const User = {
  async list(sortBy = null) {
    return apiFetch(sortBy ? `${BASE}?sortBy=${sortBy}` : BASE);
  },
  async get(id) {
    return apiFetch(`${BASE}/${id}`);
  },
  async findByEmail(email) {
    return apiFetch(`${BASE}/by-email?email=${encodeURIComponent(email)}`);
  },
  async create(data) {
    return apiFetch(BASE, { method: 'POST', body: data });
  },
  async update(id, data) {
    return apiFetch(`${BASE}/${id}`, { method: 'PUT', body: data });
  },
  async delete(id) {
    return apiFetch(`${BASE}/${id}`, { method: 'DELETE' });
  },
  async filter(query = {}) {
    return apiFetch(`${BASE}?filter=${encodeURIComponent(JSON.stringify(query))}`);
  },
};
