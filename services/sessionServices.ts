import { supabase } from '../lib/supabase';
import type { ChallengeSession } from '../types/session';

type SessionRow = {
  id: number;
  created_at: string;
  challenge_id: string;
  session_status: string;
  completeness_score: number;
  payload: ChallengeSession;
};

export async function fetchSessionsFromSupabase(limit = 10): Promise<ChallengeSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
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

type SaveSessionResult = {
  remoteId: number;
  mode: 'inserted' | 'updated';
};

export async function saveSessionToSupabase(
  session: ChallengeSession,
  completenessScore: number
): Promise<SaveSessionResult> {
  const payload = {
    ...session,
    remoteId: session.remoteId,
  };

  if (!session.remoteId) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
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