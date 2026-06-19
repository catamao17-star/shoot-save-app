import { supabase } from '../lib/supabase';
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

function mapRowsToSessions(rows: SessionRow[]): ChallengeSession[] {
  return rows
    .map((row) => {
      const payload = row.payload as ChallengeSession;

      return {
        ...payload,
        remoteId: payload.remoteId ?? row.id,
        reportCount: payload.reportCount ?? 0,
        lastReportExportedAt: payload.lastReportExportedAt ?? null,
      };
    })
    .filter(Boolean);
}

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

  return mapRowsToSessions((data ?? []) as SessionRow[]);
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

  return mapRowsToSessions((data ?? []) as SessionRow[]);
}

export async function fetchPagedSessionsFromSupabase(
  page: number,
  pageSize: number
): Promise<{
  sessions: ChallengeSession[];
  hasMore: boolean;
}> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No authenticated user found.');
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SessionRow[];
  const sessions = mapRowsToSessions(rows);

  return {
    sessions,
    hasMore: rows.length === pageSize,
  };
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

  const payload: ChallengeSession = {
    ...session,
    remoteId: session.remoteId,
    reportCount: session.reportCount ?? 0,
    lastReportExportedAt: session.lastReportExportedAt ?? null,
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

export async function deleteSessionFromSupabase(remoteId: number): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No authenticated user found.');
  }

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', remoteId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}