import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/messages — list all messages (pinned first, then newest)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles:author_id(full_name, role)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const messages = (data || []).map(m => ({
      ...m,
      author_name: m.profiles?.full_name || 'FitBro Coach',
      author_role: m.profiles?.role || 'admin',
      profiles: undefined,
    }));

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/messages — create message (admin only)
router.post('/', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { title, content, pinned } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        author_id: req.user.id,
        title: title?.trim() || null,
        content: content.trim(),
        pinned: pinned || false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/messages/:id — edit message (admin only)
router.put('/:id', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { title, content, pinned } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (content !== undefined) updates.content = content.trim();
    if (title !== undefined) updates.title = title?.trim() || null;
    if (pinned !== undefined) updates.pinned = pinned;

    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Mensaje no encontrado' });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/messages/:id — delete message (admin only)
router.delete('/:id', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
