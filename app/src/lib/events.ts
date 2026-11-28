import Constants from 'expo-constants';
import { supabase } from './supabase';

export type AppEvent = 'app_open' | 'spot_saved' | 'route_opened' | 'upload_done' | 'list_shared';

/** Zählt ein Ereignis für die Testphase-Ziele (nur Art + Zeit, keine Inhalte). Nur angemeldet, Fehler egal. */
export async function track(event: AppEvent) {
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (uid) await supabase.from('app_events').insert({ user_id: uid, event });
  } catch {}
}

export const appVersion = () => Constants.expoConfig?.version ?? '?';

export async function sendFeedback(uid: string, message: string) {
  const { error } = await supabase.from('feedback').insert({ user_id: uid, message: message.trim(), app_version: appVersion() });
  if (error) throw error;
}

export type TestStats = { testers: number; saved_pct: number; route_pct: number; upload_pct: number; returned_pct: number; feedback_count: number };
export async function loadStats(): Promise<TestStats | null> {
  const { data } = await supabase.rpc('admin_testphase_stats');
  return (data?.[0] as TestStats) ?? null;
}
export async function loadFeedback(): Promise<{ message: string; username: string | null; app_version: string | null; created_at: string }[]> {
  const { data } = await supabase.rpc('admin_feedback');
  return data ?? [];
}
