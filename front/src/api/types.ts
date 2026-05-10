export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  /** Backend uses `error` in dto.APIResponse */
  error?: string;
  message?: string;
};

export type LoginResponse = {
  token: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = ApiResponse<{
  id: number;
  username: string;
  email: string;
  role_id?: number | null;
}>;

