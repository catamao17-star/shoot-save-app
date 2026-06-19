\import { supabase } from '../lib/supabase';
import type { ChallengeSession } from '../types/session';

type SessionRow = {
  id: number;
  created_at: string;
  challenge_id: string;
  session_status: string;
  completeness_score: number;
  user_id: string;
  payload: ChallengeSession;
};

export async function fetchSessionsFromSupabase(limit = 10): Promise<ChallengeSession[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No authenticated user found.');
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SessionRow[])
    .map((row) => {
      const payload = row.payload as ChallengeSession;

      return {
        ...payload,
        remoteId: payload.remoteId ?? row.id,
      };
    })
    .filter(Boolean);
}

export async function fetchAllSessionsFromSupabase(): Promise<ChallengeSession[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No authenticated user found.');
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SessionRow[])
    .map((row) => {
      const payload = row.payload as ChallengeSession;

      return {
        ...payload,
        remoteId: payload.remoteId ?? row.id,
      };
    })
    .filter(Boolean);
}

type SaveSessionResult = {
  remoteId: number;
  mode: 'inserted' | 'updated';
};

export async function saveSessionToSupabase(
  session: ChallengeSession,
  completenessScore: number
): Promise<SaveSessionResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No authenticated user found.');
  }

  const payload = {
    ...session,
    remoteId: session.remoteId,
  };

  if (!session.remoteId) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        challenge_id: session.challenge.id,
        session_status: session.status,
        completeness_score: completenessScore,
        payload,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      remoteId: data.id,
      mode: 'inserted',
    };
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      user_id: user.id,
      challenge_id: session.challenge.id,
      session_status: session.status,
      completeness_score: completenessScore,
      payload,
    })
    .eq('id', session.remoteId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    remoteId: session.remoteId,
    mode: 'updated',
  };
}