import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import {
  findInactiveUsers,
  deactivateUsers,
  permanentlyDeleteUsers,
  cleanOrphanedData,
  getStorageStats,
  cleanOldCalculations,
  cleanOldMessages,
} from '../utils/data-cleanup.js';

const router = Router();

// ─── All routes require admin ────────────────────────────────────────────

// GET /api/admin/inactive-users?months=6
router.get('/inactive-users', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const users = await findInactiveUsers(months);
    res.json({
      threshold_months: months,
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/deactivate-users
// Body: { user_ids: ["uuid1", "uuid2"] }
router.post('/deactivate-users', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { user_ids } = req.body;
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'user_ids debe ser un array con al menos un ID' });
    }
    const result = await deactivateUsers(user_ids);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/delete-users
// Body: { user_ids: ["uuid1", "uuid2"], confirm: true }
router.delete('/delete-users', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { user_ids, confirm } = req.body;
    if (!confirm) {
      return res.status(400).json({
        error: 'Debes enviar confirm: true para confirmar la eliminacion permanente',
      });
    }
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'user_ids debe ser un array' });
    }
    const result = await permanentlyDeleteUsers(user_ids);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/storage-stats
router.get('/storage-stats', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const stats = await getStorageStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/cleanup-orphaned
router.post('/cleanup-orphaned', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const report = await cleanOrphanedData();
    res.json({ message: 'Limpieza de datos huerfanos completada', report });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/cleanup-calculations
router.post('/cleanup-calculations', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const result = await cleanOldCalculations();
    res.json({ message: 'Limpieza de calculos antiguos completada', ...result });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/cleanup-messages
router.post('/cleanup-messages', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const result = await cleanOldMessages(req.body?.days || 90);
    res.json({ message: 'Limpieza de mensajes antiguos completada', ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/system-health
router.get('/system-health', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const stats = await getStorageStats();
    const inactive = await findInactiveUsers(6);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      storage: stats,
      inactive_users_6m: inactive.length,
      recommendations: [
        inactive.length > 0
          ? `${inactive.length} usuarios inactivos por mas de 6 meses. Considera desactivarlos.`
          : 'No hay usuarios inactivos.',
        stats.deactivated_users > 0
          ? `${stats.deactivated_users} usuarios desactivados pendientes de eliminacion permanente.`
          : null,
      ].filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
