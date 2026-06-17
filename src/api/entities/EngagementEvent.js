import { apiFetch } from '@/api/client';

const BASE = '/api/engagements';

export const EngagementEvent = {
  async list(sortBy = null) {
    return apiFetch(sortBy ? `${BASE}?sortBy=${sortBy}` : BASE);
  },
  async create(data) {
    return apiFetch(BASE, { method: 'POST', body: data });
  },
  async filter(query = {}) {
    return apiFetch(`${BASE}?filter=${encodeURIComponent(JSON.stringify(query))}`);
  },
  async filterByExhibitor(exhibitorId, exhibitorName) {
    return apiFetch(
      `${BASE}/by-exhibitor?id=${encodeURIComponent(exhibitorId)}&name=${encodeURIComponent(exhibitorName)}`
    );
  },
};
