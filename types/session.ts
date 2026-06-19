import type {
  ChallengeSetupData,
  GoalkeeperResponseData,
  ShooterUploadData,
} from './challenge';

export type SessionStatus =
  | 'created'
  | 'shooter_submitted'
  | 'goalkeeper_submitted'
  | 'complete';

export type QualityRating = 'Good' | 'Okay' | 'Poor';

export type QualityChecklist = {
  cueHidingQuality: QualityRating;
  cameraSetupQuality: QualityRating;
  reactionClarity: QualityRating;
};

export type ChallengeSession = {
  challenge: ChallengeSetupData;
  shooterUpload: ShooterUploadData | null;
  goalkeeperResponse: GoalkeeperResponseData | null;
  status: SessionStatus;
  analystNotes: string;
  qualityChecklist: QualityChecklist;
  remoteId?: number;
  reportCount?: number;
  lastReportExportedAt?: string | null;
};

export const defaultQualityChecklist: QualityChecklist = {
  cueHidingQuality: 'Okay',
  cameraSetupQuality: 'Okay',
  reactionClarity: 'Okay',
};