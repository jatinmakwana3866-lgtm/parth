import { supabase } from './supabase';
import { getDeviceId } from './deviceFingerprint';

const COMMON_PASSWORDS = ['password', '12345678', 'password1', 'qwerty123', 'abc12345', '11111111', 'password123'];

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('At least 8 characters required');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least 1 uppercase letter required');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('At least 1 number required');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('At least 1 special character required');
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common');
  }

  return { valid: errors.length === 0, errors };
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // Device check on login
  try {
    const deviceId = getDeviceId();
    const { session } = data;
    if (session) {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-device`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ deviceId, email }),
        }
      );
      const result = await res.json();

      if (result.suspended) {
        await signOut();
        throw new Error('Account suspended. Contact support.');
      }

      return { data, deviceCheck: result };
    }
  } catch (e) {
    if ((e as Error).message.includes('suspended')) throw e;
  }

  return { data, deviceCheck: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function sendEmailVerification() {
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email || '';
  if (!email) return;
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw new Error(error.message);
}

export async function validateDeviceAndClaim(
  deviceId: string,
  email: string,
  uid: string,
  accessToken: string
): Promise<{ granted: boolean; tokens?: number; reason?: string }> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-device`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ deviceId, email, uid }),
      }
    );
    return await res.json();
  } catch {
    return { granted: false, reason: 'network_error' };
  }
}

export async function unlockContact(
  targetUserId: string,
  targetUserRole: string,
  accessToken: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unlock-contact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ targetUserId, targetUserRole }),
      }
    );
    return await res.json();
  } catch {
    return { success: false, error: 'network_error' };
  }
}

export async function syncTokenBalance(uid: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tokens')
      .eq('auth_uid', uid)
      .maybeSingle();

    if (error || !data) return 0;
    return data.tokens;
  } catch {
    return 0;
  }
}

export async function fetchTransactions(uid: string) {
  try {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_uid', uid)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  } catch {
    return [];
  }
}

export function isEmailVerified(): boolean {
  // Email verification disabled by default per requirements
  return true; // Email verification disabled by default per requirements
}

export function getCurrentSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
