// ─────────────────────────────────────────────────────────────────────────────
// User Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";

export interface ImageData {
  data: Buffer;
  contentType: string;
  originalName: string;
  size: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  blockedAt?: string | null;
  avatar?: {
    contentType: string;
    originalName: string;
    size: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// The JWT payload stored in the cookie
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// What gets attached to request context after auth verification
export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UpdateProfileInput {
  name?: string;
}
