import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';

export type Member = { id: string; username: string; avatar_url: string | null };
export type Friendship = { id: number; requester: string; addressee: string; status: 'pending' | 'accepted' };
export type Message = { id: number; sender: string; recipient: string; body: string; spot_id: number | null; created_at: string; read_at: string | null };

/** Alle Mitglieder mit Benutzername (ohne dich). Nur Name und Bild, nie E-Mail. */
export async function loadMembers(me: string): Promise<Member[]> {
  const { data, error } = await supabase.from('profiles').select('id, username, avatar_url').not('username', 'is', null).neq('id', me).order('username');
  if (error) throw error;
  return (data ?? []) as Member[];
}

export async function loadFriendships(): Promise<Friendship[]> {
  const { data, error } = await supabase.from('friendships').select('id, requester, addressee, status');
  if (error) throw error;
  return (data ?? []) as Friendship[];
}

export async function sendRequest(me: string, other: string) {
  const { error } = await supabase.from('friendships').insert({ requester: me, addressee: other });
  if (error && error.code !== '23505') throw error;
}
export async function acceptRequest(id: number) {
  const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
  if (error) throw error;
}
/** Anfrage ablehnen/zurückziehen oder Freund entfernen. */
export async function removeFriendship(id: number) {
  const { error } = await supabase.from('friendships').delete().eq('id', id);
  if (error) throw error;
}

/** Letzte Nachricht und Anzahl ungelesener je Gesprächspartner. */
export async function loadThreads(me: string): Promise<Record<string, { last: Message; unread: number }>> {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) throw error;
  const out: Record<string, { last: Message; unread: number }> = {};
  for (const m of (data ?? []) as Message[]) {
    const other = m.sender === me ? m.recipient : m.sender;
    out[other] ??= { last: m, unread: 0 };
    if (m.recipient === me && !m.read_at) out[other].unread += 1;
  }
  return out;
}

export async function loadConversation(me: string, other: string): Promise<Message[]> {
  const { data, error } = await supabase.from('messages').select('*')
    .or(`and(sender.eq.${me},recipient.eq.${other}),and(sender.eq.${other},recipient.eq.${me})`)
    .order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(me: string, other: string, body: string, spotId?: number | null) {
  const { error } = await supabase.from('messages').insert({ sender: me, recipient: other, body: body.trim(), spot_id: spotId ?? null });
  if (error) throw error;
}

export async function markRead(me: string, other: string) {
  await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('sender', other).eq('recipient', me).is('read_at', null);
  refreshUnread(me);
}

/* ---------- Ungelesen-Zähler (Abzeichen an der Tab-Leiste) ---------- */
let unread = 0;
const listeners = new Set<() => void>();
export async function refreshUnread(me: string | null | undefined) {
  let n = 0;
  if (me) {
    const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('recipient', me).is('read_at', null);
    n = count ?? 0;
  }
  if (n !== unread) { unread = n; listeners.forEach((l) => l()); }
}
export function useUnread() {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => unread);
}
