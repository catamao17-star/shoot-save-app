import type {
  Challenge,
  ShooterUploadData,
  GoalkeeperResponseData,
} from './challenge';

export type ChallengeSession = {
  challenge: Challenge;
  shooterUpload: ShooterUploadData | null;
  goalkeeperResponse: GoalkeeperResponseData | null;
};