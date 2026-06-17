import { apiFetch } from '@/api/client';

const BASE = '/api/magazine-pages';

export const MagazinePage = {
  async list() {
    return apiFetch(BASE);
  },
  async update(pageNum, data) {
    return apiFetch(`${BASE}/${pageNum}`, { method: 'PUT', body: data });
  },
  async getUploadUrl(pageNum, oldImageUrl = null) {
    return apiFetch('/api/upload/magazine-image-url', {
      method: 'POST',
      body: { pageNum, oldImageUrl },
    });
  },
};
