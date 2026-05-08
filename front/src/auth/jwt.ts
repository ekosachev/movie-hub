export type JwtPayload = {
  sub?: number | string;
  exp?: number;
  permissions?: string[];
};

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

export function parseJwt(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export type AppRole = 'user' | 'content_manager' | 'admin';

export function roleFromPermissions(permissions: string[] | undefined): AppRole {
  const set = new Set(permissions ?? []);
  if (set.has('ban_users') || set.has('remove_comments')) return 'admin';
  if (set.has('create_movies')) return 'content_manager';
  return 'user';
}

export function userIdFromSub(sub: JwtPayload['sub']): number | null {
  if (typeof sub === 'number') return sub;
  if (typeof sub === 'string') {
    const n = Number(sub);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

