import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  Challenge,
  ShooterUploadData,
  GoalkeeperResponseData,
} from '../types/challenge';

type ChallengeContextType = {
  currentChallenge: Challenge | null;
  setCurrentChallenge: (challenge: Challenge | null) => void;
  shooterUploadData: ShooterUploadData | null;
  setShooterUploadData: (data: ShooterUploadData | null) => void;
  goalkeeperResponseData: GoalkeeperResponseData | null;
  setGoalkeeperResponseData: (data: GoalkeeperResponseData | null) => void;
};

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function ChallengeProvider({ children }: Props) {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [shooterUploadData, setShooterUploadData] = useState<ShooterUploadData | null>(null);
  const [goalkeeperResponseData, setGoalkeeperResponseData] =
    useState<GoalkeeperResponseData | null>(null);

  const value = useMemo(
    () => ({
      currentChallenge,
      setCurrentChallenge,
      shooterUploadData,
      setShooterUploadData,
      goalkeeperResponseData,
      setGoalkeeperResponseData,
    }),
    [currentChallenge, shooterUploadData, goalkeeperResponseData]
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