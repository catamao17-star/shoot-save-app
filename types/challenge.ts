export type Challenge = {
  id: string;
  createdAt: string;
  challengeName: string;
  opponent: string;
  occlusionMethod: string;
};

export type CameraAngle = 'Front' | 'Side' | 'Behind Goal' | 'Custom';

export type ShooterUploadData = {
  submittedAt: string;
  cameraAngle: CameraAngle;
  shotNotes: string;
  videoSelected: boolean;
};

export type ReactionDirection = 'Left' | 'Center' | 'Right';

export type SaveAttemptResult = 'Saved' | 'Missed' | 'Late Reaction';

export type GoalkeeperResponseData = {
  submittedAt: string;
  reactionDirection: ReactionDirection;
  reactionTimingNote: string;
  saveAttemptResult: SaveAttemptResult;
  responseVideoSelected: boolean;
};