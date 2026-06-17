import { apiFetch } from '@/api/client';

const BASE = '/api/guide-pages';

export const GuidePage = {
  async list() {
    return apiFetch(BASE);
  },
  async update(pageNum, data) {
    return apiFetch(`${BASE}/${pageNum}`, { method: 'PUT', body: data });
  },
  async getUploadUrl(pageNum, oldImageUrl = null) {
    return apiFetch('/api/upload/guide-image-url', {
      method: 'POST',
      body: { pageNum, oldImageUrl },
    });
  },
};
