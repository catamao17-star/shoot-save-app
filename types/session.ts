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

export type QualityRating = 'Good' | 'Okay' | 'Poor';

export type SessionQualityChecklist = {
  cueHidingQuality: QualityRating;
  cameraSetupQuality: QualityRating;
  reactionClarity: QualityRating;
};

export type ChallengeSession = {
  remoteId: number | null;
  challenge: Challenge;
  shooterUpload: ShooterUploadData | null;
  goalkeeperResponse: GoalkeeperResponseData | null;
  status: SessionStatus;
  analystNotes: string;
  qualityChecklist: SessionQualityChecklist;
};