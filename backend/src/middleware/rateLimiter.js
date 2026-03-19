import rateLimit from 'express-rate-limit';

// ─── General API limiter: 100 requests per 15 min per IP ────────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
});

// ─── Strict limiter for expensive operations: 10 per 15 min ─────────────
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de solicitudes alcanzado para esta operación. Intenta de nuevo más tarde.' },
});

// ─── Auth limiter: 20 attempts per 15 min (login/register) ─────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.' },
});
