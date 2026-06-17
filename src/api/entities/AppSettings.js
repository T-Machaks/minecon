import { apiFetch } from '@/api/client';

const BASE = '/api/app-settings';

export const AppSettings = {
  async get() {
    return apiFetch(BASE);
  },
  async update(data) {
    return apiFetch(BASE, { method: 'PUT', body: data });
  },
};
