/**
 * Auth HTTP client.
 *
 * Thin wrapper around the singleton base `http` client. Each method
 * maps to one backend endpoint but is intentionally left without a body
 * — fill them in when wiring forms / loaders.
 *
 * Group by domain (login, signup, password, email, social, session) so
 * you can see the full surface area at a glance.
 */
import http from "@/lib/http/client";

// Re-export the typed axios instance in case a feature needs to escape.
export { http };

export class AuthHttp {
  /* ---- session ---- */
  async checkSession(): Promise<unknown> { return; /* TODO: http.get(...) */ }
  async logout(): Promise<unknown> { return; /* TODO */ }

  /* ---- credentials ---- */
  async login(_payload: { login: string; password: string; remember?: boolean }): Promise<unknown> { return; /* TODO */ }
  async signUp(_payload: Record<string, unknown>): Promise<unknown> { return; /* TODO */ }

  /* ---- password recovery ---- */
  async requestPasswordReset(_email: string): Promise<unknown> { return; /* TODO */ }
  async resetPassword(_key: string, _newPassword: string): Promise<unknown> { return; /* TODO */ }
  async changePassword(_payload: Record<string, unknown>): Promise<unknown> { return; /* TODO */ }

  /* ---- email verification ---- */
  async verifyEmailByKey(_key: string): Promise<unknown> { return; /* TODO */ }
  async verifyEmailByOtp(_code: string): Promise<unknown> { return; /* TODO */ }
  async requestVerificationEmail(): Promise<unknown> { return; /* TODO */ }

  /* ---- account activation ---- */
  async activate(_uuid: string, _token: string): Promise<unknown> { return; /* TODO */ }

  /* ---- social ---- */
  async submitSocialLogin(_provider: string): Promise<unknown> { return; /* TODO */ }
  async completeSocialLogin(_payload: Record<string, unknown>): Promise<unknown> { return; /* TODO */ }
}

export const authHttp = new AuthHttp();
export default authHttp;
