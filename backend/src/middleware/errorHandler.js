export function errorHandler(err, req, res, next) {
  // Don't log stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.error('Error:', err.message, err.stack?.split('\n').slice(0, 3).join('\n'));
  } else {
    console.error('Error:', err.message);
  }

  // ─── Payload too large ─────────────────────────────────────────────
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload demasiado grande. Limite: 2MB.' });
  }

  // ─── Malformed JSON ────────────────────────────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON invalido en el body de la solicitud.' });
  }

  // ─── Supabase/PostgreSQL CHECK constraint violations ───────────────
  if (err.code === '23514' || err.message?.includes('violates check constraint')) {
    return res.status(400).json({
      error: 'Valor invalido: ' + (err.details || err.message),
    });
  }

  // ─── Supabase/PostgreSQL invalid input ─────────────────────────────
  if (err.code === '22P02' || err.code === '23503') {
    return res.status(400).json({
      error: 'Dato invalido: ' + (err.details || err.message),
    });
  }

  // ─── Supabase column not found (missing migration) ─────────────────
  if (err.code === '42703' || err.message?.includes('column') && err.message?.includes('does not exist')) {
    return res.status(400).json({
      error: 'Campo no disponible. Es posible que se requiera una migracion de base de datos.',
    });
  }

  // ─── Rate limit exceeded (backup, express-rate-limit handles this) ─
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Demasiadas solicitudes. Intenta de nuevo mas tarde.',
    });
  }

  // ─── Default error ─────────────────────────────────────────────────
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
}
