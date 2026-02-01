import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const handlers = [
  http.post(`${BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      user: {
        id: 'user-1',
        name: 'Test User',
        role: 'ADMIN',
        tenant_id: 'tenant-1',
      },
    });
  }),

  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 3600,
    });
  }),

  http.get(`${BASE_URL}/dashboard/today`, () => {
    return HttpResponse.json({ data: {} });
  }),

  http.get(`${BASE_URL}/loans`, () => {
    return HttpResponse.json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }),

  http.get(`${BASE_URL}/customers`, () => {
    return HttpResponse.json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }),
];
