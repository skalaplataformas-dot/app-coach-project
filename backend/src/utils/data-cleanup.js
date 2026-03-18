import supabase from '../config/supabase.js';

// ═══════════════════════════════════════════════════════════════════════
// DATA LIFECYCLE MANAGEMENT
// Handles cleanup of inactive accounts, orphaned data, and storage stats
// ═══════════════════════════════════════════════════════════════════════

/**
 * Find users inactive for X months
 * @param {number} months - Threshold in months (default 6)
 * @returns {Array} List of inactive users with id, email, full_name, last_active_at
 */
export async function findInactiveUsers(months = 6) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, created_at, last_active_at, updated_at')
    .or(`last_active_at.is.null,last_active_at.lt.${cutoff.toISOString()}`)
    .is('deactivated_at', null)
    .order('last_active_at', { ascending: true, nullsFirst: true });

  if (error) throw error;

  // For users with no last_active_at, check if created_at is older than threshold
  return (data || []).filter(u => {
    const lastActivity = u.last_active_at || u.updated_at || u.created_at;
    return !lastActivity || new Date(lastActivity) < cutoff;
  });
}

/**
 * Soft-deactivate users (mark for deletion, don't actually delete)
 * @param {Array<string>} userIds - Array of user UUIDs
 * @returns {Object} Result with count of deactivated users
 */
export async function deactivateUsers(userIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { deactivated: 0 };
  }

  const now = new Date().toISOString();
  let deactivated = 0;

  for (const userId of userIds) {
    const { error } = await supabase
      .from('profiles')
      .update({ deactivated_at: now })
      .eq('id', userId)
      .is('deactivated_at', null);

    if (!error) deactivated++;
  }

  return { deactivated };
}

/**
 * Permanently delete deactivated users and all their data
 * Uses Supabase Auth admin to cascade delete
 * @param {Array<string>} userIds - Array of user UUIDs to permanently delete
 * @returns {Object} Result with counts
 */
export async function permanentlyDeleteUsers(userIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const results = { deleted: 0, errors: [] };

  for (const userId of userIds) {
    try {
      // Delete related data first (in case CASCADE isn't set)
      await supabase.from('workout_logs').delete().eq('user_id', userId);
      await supabase.from('nutrition_plans').delete().eq('user_id', userId);
      await supabase.from('metabolic_results').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);

      // Delete from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        results.errors.push({ userId, error: error.message });
      } else {
        results.deleted++;
      }
    } catch (err) {
      results.errors.push({ userId, error: err.message });
    }
  }

  return results;
}

/**
 * Find and clean orphaned data (records without valid user references)
 * @returns {Object} Count of orphaned records found/cleaned per table
 */
export async function cleanOrphanedData() {
  const report = {};
  const tables = ['metabolic_results', 'nutrition_plans', 'workout_logs'];

  for (const table of tables) {
    // Get all user_ids in this table
    const { data: records } = await supabase
      .from(table)
      .select('user_id')
      .limit(10000);

    if (!records || records.length === 0) {
      report[table] = { found: 0, cleaned: 0 };
      continue;
    }

    // Get unique user IDs
    const userIds = [...new Set(records.map(r => r.user_id))];

    // Check which ones exist in profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .in('id', userIds);

    const validIds = new Set((profiles || []).map(p => p.id));
    const orphanedIds = userIds.filter(id => !validIds.has(id));

    let cleaned = 0;
    if (orphanedIds.length > 0) {
      for (const orphanId of orphanedIds) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', orphanId);
        if (!error) cleaned++;
      }
    }

    report[table] = { found: orphanedIds.length, cleaned };
  }

  return report;
}

/**
 * Get storage statistics for admin dashboard
 * @returns {Object} Row counts and storage estimates per table
 */
export async function getStorageStats() {
  const tables = [
    'profiles', 'metabolic_results', 'nutrition_plans',
    'foods', 'workouts', 'exercises', 'workout_logs', 'onboarding_sections',
  ];

  const stats = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    stats[table] = { rows: error ? 'error' : (count || 0) };
  }

  // Photo storage: count profiles with photos
  const { data: photoCounts } = await supabase
    .from('profiles')
    .select('id')
    .or('photo_front.neq.,photo_side.neq.,photo_back.neq.');

  stats.profiles_with_photos = photoCounts?.length || 0;

  // Deactivated users count
  const { count: deactivatedCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('deactivated_at', 'is', null);

  stats.deactivated_users = deactivatedCount || 0;

  // Total active users
  const { count: activeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .is('deactivated_at', null);

  stats.active_users = activeCount || 0;

  return stats;
}

/**
 * Clean old metabolic calculation history (keep last 10 per user)
 * @returns {Object} Count of cleaned records
 */
export async function cleanOldCalculations() {
  // Get users with more than 10 metabolic results
  const { data: users } = await supabase
    .from('profiles')
    .select('id');

  if (!users) return { cleaned: 0 };

  let totalCleaned = 0;

  for (const user of users) {
    const { data: results } = await supabase
      .from('metabolic_results')
      .select('id, calculated_at')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false });

    if (results && results.length > 10) {
      const toDelete = results.slice(10).map(r => r.id);
      const { error } = await supabase
        .from('metabolic_results')
        .delete()
        .in('id', toDelete);

      if (!error) totalCleaned += toDelete.length;
    }
  }

  return { cleaned: totalCleaned };
}
