import { apiFetch } from './http';
import type { LoginResponse, RegisterRequest, RegisterResponse } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/users', {
    method: 'POST',
    body: payload,
  });
}
