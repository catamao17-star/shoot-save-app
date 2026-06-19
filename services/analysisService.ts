import type { ChallengeSession, QualityRating } from '../types/session';

export type SessionAnalysis = {
  readinessScore: number;
  verdict: 'Strong Session' | 'Usable With Gaps' | 'Weak Session';
  flags: string[];
  recommendations: string[];
};

function ratingScore(value: QualityRating): number {
  switch (value) {
    case 'Good':
      return 10;
    case 'Okay':
      return 6;
    case 'Poor':
      return 2;
    default:
      return 0;
  }
}

export function analyzeSession(session: ChallengeSession): SessionAnalysis {
  let score = 0;
  const flags: string[] = [];
  const recommendations: string[] = [];

  if (session.challenge) score += 10;

  if (session.shooterUpload) {
    score += 15;
  } else {
    flags.push('Shooter submission is missing.');
    recommendations.push('Complete the shooter step before reviewing the session.');
  }

  if (session.goalkeeperResponse) {
    score += 15;
  } else {
    flags.push('Goalkeeper submission is missing.');
    recommendations.push('Complete the goalkeeper response step.');
  }

  if (session.shooterUpload?.videoFilename) {
    score += 15;
  } else {
    flags.push('Shooter video is missing.');
    recommendations.push('Attach a shooter video for better review quality.');
  }

  if (session.goalkeeperResponse?.videoFilename) {
    score += 15;
  } else {
    flags.push('Goalkeeper video is missing.');
    recommendations.push('Attach a goalkeeper video for full comparison.');
  }

  if (session.analystNotes.trim()) {
    score += 10;
  } else {
    flags.push('Analyst notes are empty.');
    recommendations.push('Add short analyst notes to capture context or review findings.');
  }

  score += ratingScore(session.qualityChecklist.cueHidingQuality);
  score += ratingScore(session.qualityChecklist.cameraSetupQuality);
  score += ratingScore(session.qualityChecklist.reactionClarity);

  if (session.qualityChecklist.cueHidingQuality === 'Poor') {
    flags.push('Cue hiding quality is poor.');
    recommendations.push('Improve cue hiding setup to reduce early visual clues.');
  }

  if (session.qualityChecklist.cameraSetupQuality === 'Poor') {
    flags.push('Camera setup quality is poor.');
    recommendations.push('Stabilize or reposition the camera for clearer capture.');
  }

  if (session.qualityChecklist.reactionClarity === 'Poor') {
    flags.push('Reaction clarity is poor.');
    recommendations.push('Capture the goalkeeper response from a clearer angle.');
  }

  if (
    session.goalkeeperResponse?.saveAttemptResult === 'Late Reaction' &&
    !recommendations.includes('Review reaction timing and compare release-to-move delay.')
  ) {
    recommendations.push('Review reaction timing and compare release-to-move delay.');
  }

  if (
    session.goalkeeperResponse?.saveAttemptResult === 'Missed' &&
    !recommendations.includes('Review shot placement versus goalkeeper direction.')
  ) {
    recommendations.push('Review shot placement versus goalkeeper direction.');
  }

  if (
    session.shooterUpload?.cameraAngle === 'Custom' &&
    !recommendations.includes('Standardize the camera angle for easier session comparison.')
  ) {
    recommendations.push('Standardize the camera angle for easier session comparison.');
  }

  const readinessScore = Math.max(0, Math.min(100, score));

  let verdict: SessionAnalysis['verdict'] = 'Weak Session';
  if (readinessScore >= 80) {
    verdict = 'Strong Session';
  } else if (readinessScore >= 55) {
    verdict = 'Usable With Gaps';
  }

  return {
    readinessScore,
    verdict,
    flags,
    recommendations,
  };
}