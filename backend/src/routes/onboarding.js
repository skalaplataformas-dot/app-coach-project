import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { validatePhoto, validateSectionUpdate } from '../middleware/validate.js';

const router = Router();

// ─── PUBLIC (authenticated): Get enabled sections for onboarding flow ────
router.get('/sections', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('onboarding_sections')
      .select('*')
      .eq('enabled', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── ADMIN: Get ALL sections (including disabled) ────────────────────────
router.get('/admin/sections', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('onboarding_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── ADMIN: Update a section (enable/disable, reorder, rename) ───────────
router.put('/admin/sections/:id', requireAuth, adminOnly, ...validateSectionUpdate, async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'icon', 'sort_order', 'enabled', 'required'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('onboarding_sections')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── ADMIN: Bulk reorder sections ────────────────────────────────────────
router.put('/admin/sections-reorder', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { sections } = req.body; // [{ id, sort_order }, ...]
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'sections must be an array' });
    }

    for (const s of sections) {
      await supabase
        .from('onboarding_sections')
        .update({ sort_order: s.sort_order })
        .eq('id', s.id);
    }

    const { data } = await supabase
      .from('onboarding_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Upload photo (stores URL in profile) ────────────────────────────────
router.post('/photo', requireAuth, ...validatePhoto, async (req, res, next) => {
  try {
    const { type, url } = req.body; // type: 'front' | 'side' | 'back'
    if (!['front', 'side', 'back'].includes(type)) {
      return res.status(400).json({ error: 'type must be front, side, or back' });
    }

    const field = `photo_${type}`;
    const { data, error } = await supabase
      .from('profiles')
      .update({ [field]: url, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
