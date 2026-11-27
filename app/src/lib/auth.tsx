import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import { prepareImage, uploadFile } from './upload';

export type Profile = { id: string; username: string | null; avatar_url: string | null };

type Auth = {
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Speichert Benutzername und optional ein neues Profilbild. Gibt eine Fehlermeldung oder null zurück. */
  saveProfile: (username: string, avatarUri?: string | null) => Promise<string | null>;
};

const Ctx = createContext<Auth | null>(null);

/** Übersetzt Supabase-Fehler in verständliche Sätze. */
function explain(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-Mail oder Passwort stimmt nicht.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Diese E-Mail ist schon registriert. Melde dich stattdessen an.';
  if (m.includes('password should be at least') || m.includes('weak password')) return 'Das Passwort braucht mindestens 8 Zeichen.';
  if (m.includes('invalid') && m.includes('email')) return 'Diese E-Mail-Adresse sieht nicht richtig aus.';
  if (m.includes('duplicate key') || m.includes('profiles_username_key')) return 'Diesen Benutzernamen gibt es schon. Probier einen anderen.';
  if (m.includes('username_format')) return 'Benutzername: 3 bis 24 Zeichen, nur Kleinbuchstaben, Zahlen, Punkt und Unterstrich.';
  if (m.includes('network') || m.includes('fetch')) return 'Keine Verbindung. Prüfe dein Internet und versuch es noch mal.';
  return 'Das hat nicht geklappt. Versuch es noch mal.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (uid: string | undefined) => {
    if (!uid) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('id, username, avatar_url').eq('id', uid).maybeSingle();
    setProfile(data ?? { id: uid, username: null, avatar_url: null });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      loadProfile(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    return error ? explain(error.message) : null;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? explain(error.message) : null;
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const saveProfile = useCallback(async (username: string, avatarUri?: string | null) => {
    const uid = session?.user.id;
    if (!uid) return 'Bitte melde dich zuerst an.';
    try {
      let avatar_url = profile?.avatar_url ?? null;
      if (avatarUri) {
        const small = await prepareImage(avatarUri, 400);
        const path = `${uid}/avatar-${Date.now()}.jpg`;
        avatar_url = await uploadFile('avatars', path, small);
      }
      const { error } = await supabase.from('profiles').update({ username: username.trim().toLowerCase(), avatar_url }).eq('id', uid);
      if (error) return explain(error.message);
      await loadProfile(uid);
      return null;
    } catch (e) {
      return explain(String(e));
    }
  }, [session, profile, loadProfile]);

  return (
    <Ctx.Provider value={{ ready, session, profile, signUp, signIn, signOut, saveProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const a = useContext(Ctx);
  if (!a) throw new Error('useAuth außerhalb von AuthProvider');
  return a;
}
