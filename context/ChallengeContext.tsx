import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Challenge } from '../types/challenge';
import type { ShooterUploadData } from '../types/challenge';
import type { GoalkeeperResponseData } from '../types/challenge';
import type { ChallengeSession, SessionQualityChecklist } from '../types/session';

type ChallengeContextType = {
  currentSession: ChallengeSession | null;
  sessionHistory: ChallengeSession[];
  isHydrated: boolean;
  createSession: (challenge: Challenge) => void;
  setShooterUploadData: (data: ShooterUploadData | null) => void;
  setGoalkeeperResponseData: (data: GoalkeeperResponseData | null) => void;
  setAnalystNotes: (notes: string) => void;
  setQualityChecklist: (checklist: SessionQualityChecklist) => void;
  setRemoteId: (remoteId: number) => void;
  setSessionHistory: (sessions: ChallengeSession[]) => void;
  loadSessionFromHistory: (sessionId: string) => void;
  loadSessionObject: (session: ChallengeSession) => void;
  resetSession: () => void;
};

const STORAGE_KEY = 'shoot_save_app_state_v1';

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

type PersistedState = {
  currentSession: ChallengeSession | null;
  sessionHistory: ChallengeSession[];
};

export function ChallengeProvider({ children }: Props) {
  const [currentSession, setCurrentSession] = useState<ChallengeSession | null>(null);
  const [sessionHistory, setSessionHistoryState] = useState<ChallengeSession[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadStoredState = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (raw) {
          const parsed: PersistedState = JSON.parse(raw);
          setCurrentSession(parsed.currentSession ?? null);
          setSessionHistoryState(parsed.sessionHistory ?? []);
        }
      } catch (error) {
        console.error('Failed to load persisted app state:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadStoredState();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const persistState = async () => {
      try {
        const payload: PersistedState = {
          currentSession,
          sessionHistory,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.error('Failed to persist app state:', error);
      }
    };

    persistState();
  }, [currentSession, sessionHistory, isHydrated]);

  const createSession = (challenge: Challenge) => {
    setCurrentSession({
      remoteId: null,
      challenge,
      shooterUpload: null,
      goalkeeperResponse: null,
      status: 'created',
      analystNotes: '',
      qualityChecklist: {
        cueHidingQuality: 'Okay',
        cameraSetupQuality: 'Okay',
        reactionClarity: 'Okay',
      },
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
        setSessionHistoryState((history) => {
          const withoutCurrent = history.filter(
            (session) => session.challenge.id !== updatedSession.challenge.id
          );
          return [updatedSession, ...withoutCurrent];
        });
      }

      return updatedSession;
    });
  };

  const setAnalystNotes = (notes: string) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;

      const updatedSession: ChallengeSession = {
        ...prev,
        analystNotes: notes,
      };

      if (updatedSession.status === 'complete') {
        setSessionHistoryState((history) => {
          const withoutCurrent = history.filter(
            (session) => session.challenge.id !== updatedSession.challenge.id
          );
          return [updatedSession, ...withoutCurrent];
        });
      }

      return updatedSession;
    });
  };

  const setQualityChecklist = (checklist: SessionQualityChecklist) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;

      const updatedSession: ChallengeSession = {
        ...prev,
        qualityChecklist: checklist,
      };

      if (updatedSession.status === 'complete') {
        setSessionHistoryState((history) => {
          const withoutCurrent = history.filter(
            (session) => session.challenge.id !== updatedSession.challenge.id
          );
          return [updatedSession, ...withoutCurrent];
        });
      }

      return updatedSession;
    });
  };

  const setRemoteId = (remoteId: number) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      const updatedSession = { ...prev, remoteId };

      setSessionHistoryState((history) => {
        const withoutCurrent = history.filter(
          (session) => session.challenge.id !== updatedSession.challenge.id
        );
        return [updatedSession, ...withoutCurrent];
      });

      return updatedSession;
    });
  };

  const setSessionHistory = (sessions: ChallengeSession[]) => {
    setSessionHistoryState(sessions);
  };

  const loadSessionFromHistory = (sessionId: string) => {
    const sessionToLoad = sessionHistory.find((session) => session.challenge.id === sessionId);
    if (!sessionToLoad) return;
    setCurrentSession(sessionToLoad);
  };

  const loadSessionObject = (session: ChallengeSession) => {
    setCurrentSession(session);
  };

  const resetSession = () => {
    setCurrentSession(null);
  };

  const value = useMemo(
    () => ({
      currentSession,
      sessionHistory,
      isHydrated,
      createSession,
      setShooterUploadData,
      setGoalkeeperResponseData,
      setAnalystNotes,
      setQualityChecklist,
      setRemoteId,
      setSessionHistory,
      loadSessionFromHistory,
      loadSessionObject,
      resetSession,
    }),
    [currentSession, sessionHistory, isHydrated]
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