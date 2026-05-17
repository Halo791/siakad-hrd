export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== 'undefined') return '/api/v1';
  return 'http://127.0.0.1:3101/api/v1';
}

export type RoleOption = { code: string; name: string };
export type StructuralPositionOption = {
  id: string;
  code: string;
  name: string;
  level: string;
  facultyId?: string | null;
  facultyName?: string | null;
  studyProgramId?: string | null;
  studyProgramName?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: RoleOption; structuralPositions?: StructuralPositionOption[] };
  availableRoles: RoleOption[];
};

export async function login(email: string, password: string, roleCode?: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, roleCode })
  });
  if (!res.ok) throw new Error('Login gagal');
  return res.json();
}

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('siakad_access_token') || '';
}

export function saveSession(payload: LoginResponse) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('siakad_access_token', payload.accessToken);
  localStorage.setItem('siakad_refresh_token', payload.refreshToken);
  localStorage.setItem('siakad_user', JSON.stringify(payload.user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('siakad_access_token');
  localStorage.removeItem('siakad_refresh_token');
  localStorage.removeItem('siakad_user');
}

export async function getSecureJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const token = getToken();
    if (!token) return fallback;
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function secureRequest<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Sesi login tidak ditemukan');

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Request gagal');
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

export function secureGet<T>(path: string): Promise<T> {
  return secureRequest<T>('GET', path);
}

export function securePost<T>(path: string, body: unknown): Promise<T> {
  return secureRequest<T>('POST', path, body);
}

export function securePatch<T>(path: string, body: unknown): Promise<T> {
  return secureRequest<T>('PATCH', path, body);
}

export function secureDelete<T>(path: string): Promise<T> {
  return secureRequest<T>('DELETE', path);
}
