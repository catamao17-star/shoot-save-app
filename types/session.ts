import type {
  Challenge,
  ShooterUploadData,
  GoalkeeperResponseData,
} from './challenge';

export type SessionStatus =
  | 'created'
  | 'shooter_submitted'
  | 'goalkeeper_submitted'
  | 'complete';

export type ChallengeSession = {
  challenge: Challenge;
  shooterUpload: ShooterUploadData | null;
  goalkeeperResponse: GoalkeeperResponseData | null;
  status: SessionStatus;
};