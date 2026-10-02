import type {
  AnalyticsSummary,
  Dish,
  DishInput,
  Enrollment,
  ManagedUser,
  Restaurant,
  RestaurantInput,
  SortOption,
  User,
} from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[]>,
    public mfaRequired = false,
    public mfaSetupRequired = false,
    public enrollment?: Enrollment,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  headers.set('X-Requested-With', 'mesa-a-dois');

  const res = await fetch(path, { ...init, headers, credentials: 'same-origin', cache: 'no-store' });
  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !body.mfaRequired && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mesa:unauthorized'));
    }
    throw new ApiError(
      res.status,
      body.message ?? 'Erro na requisição',
      body.details,
      !!body.mfaRequired,
      !!body.mfaSetupRequired,
      body.enrollment,
    );
  }
  return body as T;
}

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  ...(data === undefined ? {} : { body: JSON.stringify(data) }),
});
const userPath = (id: string, suffix = '') => `/api/users/${encodeURIComponent(id)}${suffix}`;

export const api = {
  login: (email: string, password: string, code?: string) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(code ? { code } : {}) }),
    }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/api/auth/me'),
  updateMe: (name: string) => request<{ user: User }>('/api/auth/me', json('PUT', { name })),
  enrollTwoFactor: (enrollmentToken: string, code: string) =>
    request<{ user: User }>('/api/auth/2fa/enroll', json('POST', { enrollmentToken, code })),
  startTwoFactorSetup: (currentPassword: string) =>
    request<Enrollment>('/api/auth/2fa/setup', json('POST', { currentPassword })),
  logoutOthers: () => request<void>('/api/auth/logout-others', json('POST')),
  listUsers: () => request<ManagedUser[]>('/api/users'),
  createUser: (data: { name: string; email: string; password: string; currentPassword: string }) =>
    request<ManagedUser>('/api/users', json('POST', data)),
  updateUser: (id: string, data: { name?: string; email?: string }) =>
    request<ManagedUser>(userPath(id), json('PUT', data)),
  setUserPassword: (id: string, password: string, currentPassword: string) =>
    request<void>(userPath(id, '/password'), json('POST', { password, currentPassword })),
  resetUserTwoFactor: (id: string, currentPassword: string) =>
    request<void>(userPath(id, '/reset-2fa'), json('POST', { currentPassword })),
  unlockUser: (id: string) => request<void>(userPath(id, '/unlock'), json('POST')),
  deleteUser: (id: string, currentPassword: string) =>
    request<void>(userPath(id), json('DELETE', { currentPassword })),
  analyticsSummary: (days: number, includeAdmin: boolean) =>
    request<AnalyticsSummary>(`/api/analytics/summary?days=${days}&includeAdmin=${includeAdmin}`),
  listRestaurants: (params: { q?: string; sort?: SortOption } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.sort) qs.set('sort', params.sort);
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<Restaurant[]>(`/api/restaurants${suffix}`);
  },
  getRestaurant: (id: string) => request<Restaurant>(`/api/restaurants/${encodeURIComponent(id)}`),
  createRestaurant: (data: RestaurantInput) =>
    request<Restaurant>('/api/restaurants', { method: 'POST', body: JSON.stringify(data) }),
  updateRestaurant: (id: string, data: Partial<RestaurantInput>) =>
    request<Restaurant>(`/api/restaurants/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRestaurant: (id: string) =>
    request<void>(`/api/restaurants/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  createDish: (restaurantId: string, data: DishInput) =>
    request<Dish>(`/api/restaurants/${encodeURIComponent(restaurantId)}/dishes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDish: (restaurantId: string, dishId: string, data: Partial<DishInput>) =>
    request<Dish>(
      `/api/restaurants/${encodeURIComponent(restaurantId)}/dishes/${encodeURIComponent(dishId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    ),
  deleteDish: (restaurantId: string, dishId: string) =>
    request<void>(
      `/api/restaurants/${encodeURIComponent(restaurantId)}/dishes/${encodeURIComponent(dishId)}`,
      {
        method: 'DELETE',
      },
    ),
  upload: (file: File, folder: 'logos' | 'dishes') => {
    const form = new FormData();
    form.append('file', file);
    return request<{ url: string }>(`/api/uploads?folder=${folder}`, { method: 'POST', body: form });
  },
};
