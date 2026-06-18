export type Challenge = {
  id: string;
  createdAt: string;
  challengeName: string;
  opponent: string;
  occlusionMethod: string;
};

export type CameraAngle = 'Front' | 'Side' | 'Behind Goal' | 'Custom';

export type ShooterUploadData = {
  cameraAngle: CameraAngle;
  shotNotes: string;
  videoSelected: boolean;
};

export type ReactionDirection = 'Left' | 'Center' | 'Right';

export type SaveAttemptResult = 'Saved' | 'Missed' | 'Late Reaction';

export type GoalkeeperResponseData = {
  reactionDirection: ReactionDirection;
  reactionTimingNote: string;
  saveAttemptResult: SaveAttemptResult;
  responseVideoSelected: boolean;
};