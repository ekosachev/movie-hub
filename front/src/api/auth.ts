export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role_id: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function decodeJwtSub(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.sub) || null;
  } catch {
    return null;
  }
}

async function fetchUserById(id: number): Promise<UserResponse> {
  const res = await fetch(`/api/v1/users/${id}`);
  const json: ApiResponse<UserResponse> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error('Не удалось получить данные пользователя');
  }
  return json.data;
}

export async function register(data: RegisterRequest): Promise<UserResponse> {
  const res = await fetch('/api/v1/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json: ApiResponse<UserResponse> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Ошибка регистрации');
  }

  return json.data!;
}

export async function login(data: LoginRequest): Promise<{ token: string; user: UserResponse }> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.status === 401) {
    throw new Error('Неверный email или пароль');
  }

  if (!res.ok) {
    throw new Error('Ошибка входа');
  }

  const { token } = await res.json() as { token: string };

  const userId = decodeJwtSub(token);
  if (!userId) throw new Error('Ошибка обработки токена');

  const user = await fetchUserById(userId);
  return { token, user };
}
