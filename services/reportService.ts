import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { ChallengeSession } from '../types/session';
import type { SessionAnalysis } from './analysisService';

type BuildSessionReportParams = {
  session: ChallengeSession;
  analysis: SessionAnalysis;
  completenessScore: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildHtml({
  session,
  analysis,
  completenessScore,
}: BuildSessionReportParams) {
  const shooterVideo = session.shooterUpload?.videoFilename ? 'Attached' : 'Missing';
  const goalkeeperVideo = session.goalkeeperResponse?.videoFilename ? 'Attached' : 'Missing';

  const flagsHtml =
    analysis.flags.length > 0
      ? analysis.flags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join('')
      : '<li>No major flags detected.</li>';

  const recommendationsHtml =
    analysis.recommendations.length > 0
      ? analysis.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>No recommendations right now.</li>';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            padding: 24px;
            color: #111827;
          }
          h1 { font-size: 28px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 24px; margin-bottom: 10px; }
          .muted { color: #6B7280; margin-bottom: 20px; }
          .card {
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .score {
            font-size: 32px;
            font-weight: 700;
            color: #1D4ED8;
          }
          .label {
            font-weight: 700;
          }
          ul { margin-top: 8px; }
          li { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <h1>Shoot & Save Session Report</h1>
        <div class="muted">
          Generated for ${escapeHtml(session.challenge.challengeName)}
        </div>

        <div class="card">
          <h2>Session Overview</h2>
          <p><span class="label">Challenge:</span> ${escapeHtml(session.challenge.challengeName)}</p>
          <p><span class="label">Opponent:</span> ${escapeHtml(session.challenge.opponent)}</p>
          <p><span class="label">Created:</span> ${escapeHtml(
            new Date(session.challenge.createdAt).toLocaleString()
          )}</p>
          <p><span class="label">Status:</span> ${escapeHtml(session.status)}</p>
          <p><span class="label">Completeness Score:</span> ${completenessScore}/100</p>
        </div>

        <div class="card">
          <h2>Automatic Analysis</h2>
          <div class="score">${analysis.readinessScore}/100</div>
          <p><span class="label">Verdict:</span> ${escapeHtml(analysis.verdict)}</p>
        </div>

        <div class="card">
          <h2>Media Status</h2>
          <p><span class="label">Shooter Video:</span> ${shooterVideo}</p>
          <p><span class="label">Goalkeeper Video:</span> ${goalkeeperVideo}</p>
        </div>

        <div class="card">
          <h2>Quality Checklist</h2>
          <p><span class="label">Cue Hiding Quality:</span> ${escapeHtml(
            session.qualityChecklist.cueHidingQuality
          )}</p>
          <p><span class="label">Camera Setup Quality:</span> ${escapeHtml(
            session.qualityChecklist.cameraSetupQuality
          )}</p>
          <p><span class="label">Reaction Clarity:</span> ${escapeHtml(
            session.qualityChecklist.reactionClarity
          )}</p>
        </div>

        <div class="card">
          <h2>Flags</h2>
          <ul>${flagsHtml}</ul>
        </div>

        <div class="card">
          <h2>Recommendations</h2>
          <ul>${recommendationsHtml}</ul>
        </div>

        <div class="card">
          <h2>Analyst Notes</h2>
          <p>${escapeHtml(session.analystNotes?.trim() || 'No analyst notes added.')}</p>
        </div>
      </body>
    </html>
  `;
}

export async function exportSessionReportPdf(params: BuildSessionReportParams) {
  const html = buildHtml(params);

  const file = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return file.uri;
}

export async function shareSessionReportPdf(uri: string) {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share session report',
    UTI: 'com.adobe.pdf',
  });
}