/**
 * Express security middleware helpers (free / open-source).
 * Helmet, rate limits, safe error bodies, auth verification.
 */
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export const isProd = () => process.env.NODE_ENV === "production";

/** Strip stack traces and internal debug from API JSON in production. */
export function publicErrorBody(
  message: string,
  extras?: Record<string, unknown>
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    success: false,
    message,
  };
  if (!isProd() && extras) {
    Object.assign(body, extras);
  }
  return body;
}

export function applySecurityMiddleware(app: {
  use: (...args: any[]) => any;
  set?: (k: string, v: any) => any;
}) {
  // Behind reverse proxies (Vercel / nginx) for correct client IP on rate limits
  if (typeof (app as any).set === "function") {
    (app as any).set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false, // SPA + Vite inject; enable CSP at CDN when ready
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  // Generic API abuse ceiling
  app.use(
    "/api/",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isProd() ? 400 : 2000,
      standardHeaders: true,
      legacyHeaders: false,
      message: publicErrorBody("Çok fazla istek. Lütfen biraz sonra tekrar deneyin."),
    })
  );
}

/** Stricter limit for public writes (forms, votes). */
export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd() ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: publicErrorBody("Çok fazla gönderim. Lütfen 15 dakika sonra tekrar deneyin."),
});

/** Admin routes: still rate-limited to reduce token stuffing. */
export const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd() ? 120 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: publicErrorBody("Admin API istek limiti aşıldı."),
});

/** Vote-specific (per IP). */
export const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProd() ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: publicErrorBody("Oy istek limiti aşıldı. Biraz bekleyin."),
});

export function getAdminEmailAllowlist(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!fromEnv.includes("yunusemreyilmaz93@gmail.com")) {
    fromEnv.push("yunusemreyilmaz93@gmail.com");
  }
  return fromEnv;
}

export function isAdminToken(decoded: {
  email?: string;
  admin?: boolean;
}): boolean {
  if (decoded?.admin === true) return true;
  const email = (decoded?.email || "").trim().toLowerCase();
  if (!email) return false;
  return getAdminEmailAllowlist().includes(email);
}

/**
 * Factory: Firebase ID token required (any signed-in user, including anonymous).
 */
export function createRequireAuth(adminAuth: () => any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(
        publicErrorBody("Kimlik doğrulama token'ı gerekli.")
      );
    }
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token || token.startsWith("mock-admin-token-for-")) {
      return res.status(401).json(
        publicErrorBody("Geçersiz veya mock token reddedildi.")
      );
    }
    const auth = adminAuth();
    if (!auth) {
      return res.status(503).json(
        publicErrorBody("Kimlik doğrulama servisi geçici olarak kullanılamıyor.")
      );
    }
    try {
      const decoded = await auth.verifyIdToken(token);
      (req as any).user = decoded;
      next();
    } catch (e: any) {
      return res.status(401).json(
        publicErrorBody("Oturum geçersiz veya süresi dolmuş.")
      );
    }
  };
}

/**
 * Factory: admin only (custom claim or email allowlist).
 */
export function createRequireAdmin(adminAuth: () => any) {
  const requireAuth = createRequireAuth(adminAuth);
  return async (req: Request, res: Response, next: NextFunction) => {
    await requireAuth(req, res, () => {
      const user = (req as any).user;
      if (!user || !isAdminToken(user)) {
        return res.status(403).json(
          publicErrorBody("Erişim reddedildi. Bu işlemi yapmaya yetkiniz yok.")
        );
      }
      next();
    });
  };
}

/** Honeypot: reject if bot-filled hidden field is present. */
export function honeypotTriggered(body: any): boolean {
  if (!body || typeof body !== "object") return false;
  const traps = ["website", "company_url", "fax", "hp_field", "_gotcha"];
  return traps.some((k) => {
    const v = body[k];
    return typeof v === "string" && v.trim().length > 0;
  });
}

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function sanitizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim().toLowerCase();
  if (e.length < 5 || e.length > 254 || !EMAIL_RE.test(e)) return null;
  return e;
}

export function sanitizeStr(
  raw: unknown,
  max: number,
  required = true
): string | null {
  if (typeof raw !== "string") return required ? null : "";
  const s = raw.trim();
  if (required && !s) return null;
  if (s.length > max) return null;
  return s;
}
