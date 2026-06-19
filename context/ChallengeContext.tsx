import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Challenge } from '../types/challenge';
import type { ShooterUploadData } from '../types/challenge';
import type { GoalkeeperResponseData } from '../types/challenge';
import type { ChallengeSession } from '../types/session';

type ChallengeContextType = {
  currentSession: ChallengeSession | null;
  sessionHistory: ChallengeSession[];
  createSession: (challenge: Challenge) => void;
  setShooterUploadData: (data: ShooterUploadData | null) => void;
  setGoalkeeperResponseData: (data: GoalkeeperResponseData | null) => void;
  resetSession: () => void;
};

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function ChallengeProvider({ children }: Props) {
  const [currentSession, setCurrentSession] = useState<ChallengeSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<ChallengeSession[]>([]);

  const createSession = (challenge: Challenge) => {
    setCurrentSession({
      challenge,
      shooterUpload: null,
      goalkeeperResponse: null,
      status: 'created',
    });
  };

  const setShooterUploadData = (data: ShooterUploadData | null) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        shooterUpload: data,
        status: data ? 'shooter_submitted' : 'created',
      };
    });
  };

  const setGoalkeeperResponseData = (data: GoalkeeperResponseData | null) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;

      const updatedSession: ChallengeSession = {
        ...prev,
        goalkeeperResponse: data,
        status: data ? 'complete' : prev.shooterUpload ? 'shooter_submitted' : 'created',
      };

      if (data) {
        setSessionHistory((history) => {
          const withoutCurrent = history.filter(
            (session) => session.challenge.id !== updatedSession.challenge.id
          );
          return [updatedSession, ...withoutCurrent];
        });
      }

      return updatedSession;
    });
  };

  const resetSession = () => {
    setCurrentSession(null);
  };

  const value = useMemo(
    () => ({
      currentSession,
      sessionHistory,
      createSession,
      setShooterUploadData,
      setGoalkeeperResponseData,
      resetSession,
    }),
    [currentSession, sessionHistory]
  );

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

export function useChallenge() {
  const context = useContext(ChallengeContext);

  if (!context) {
    throw new Error('useChallenge must be used inside a ChallengeProvider');
  }

  return context;
}