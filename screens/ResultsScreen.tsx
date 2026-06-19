import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useChallenge } from '../context/ChallengeContext';
import ProgressSteps from '../components/ProgressSteps';
import type { QualityRating } from '../types/session';

type Props = {
  navigation: any;
};

const ratingOptions: QualityRating[] = ['Good', 'Okay', 'Poor'];

export default function ResultsScreen({ navigation }: Props) {
  const { currentSession, resetSession, setAnalystNotes, setQualityChecklist } = useChallenge();

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle}>No session found. Please create a challenge first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { challenge, shooterUpload, goalkeeperResponse, status, analystNotes, qualityChecklist } =
    currentSession;

  const isShooterComplete = !!shooterUpload;
  const isGoalkeeperComplete = !!goalkeeperResponse;
  const isRecordComplete = status === 'complete';

  const completenessScore =
    (challenge ? 20 : 0) +
    (shooterUpload ? 20 : 0) +
    (goalkeeperResponse ? 20 : 0) +
    (analystNotes.trim() ? 10 : 0) +
    (qualityChecklist ? 10 : 0) +
    (shooterUpload?.videoFilename?.trim() ? 10 : 0) +
    (goalkeeperResponse?.videoFilename?.trim() ? 10 : 0);

  const exportPayload = {
    challenge,
    status,
    completenessScore,
    analystNotes: analystNotes || '',
    qualityChecklist,
    shooterUpload,
    goalkeeperResponse,
  };

  const exportJson = JSON.stringify(exportPayload, null, 2);

  const handleCopyJson = async () => {
    try {
      await Clipboard.setStringAsync(exportJson);
      Alert.alert('Copied', 'Session JSON copied to clipboard.');
    } catch (error) {
      Alert.alert('Copy failed', 'Unable to copy JSON right now.');
    }
  };

  const handleResetSession = () => {
    Alert.alert(
      'Reset current session',
      'Are you sure you want to clear this session and all related data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSession();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const handleStartNewChallenge = () => {
    navigation.navigate('CreateChallenge');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const updateChecklistField = (
    field: 'cueHidingQuality' | 'cameraSetupQuality' | 'reactionClarity',
    value: QualityRating
  ) => {
    setQualityChecklist({
      ...qualityChecklist,
      [field]: value,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ProgressSteps currentStep={4} />

          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle}>
            Example version 1 output for the challenge.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Session Completeness Score</Text>
            <Text style={styles.scoreValue}>{completenessScore}/100</Text>
            <Text style={styles.scoreNote}>
              Based on challenge data, shooter data, goalkeeper data, notes, checklist, and media placeholders.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Completion Status</Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Session Status:</Text> {status}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Challenge Created:</Text> Yes
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Shooter Submitted:</Text> {isShooterComplete ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Goalkeeper Submitted:</Text>{' '}
              {isGoalkeeperComplete ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Record Complete:</Text> {isRecordComplete ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quality Checklist</Text>

            <Text style={styles.checklistLabel}>Cue Hiding Quality</Text>
            <View style={styles.optionRow}>
              {ratingOptions.map((option) => {
                const isSelected = qualityChecklist.cueHidingQuality === option;
                return (
                  <TouchableOpacity
                    key={`cue-${option}`}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => updateChecklistField('cueHidingQuality', option)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.checklistLabel}>Camera Setup Quality</Text>
            <View style={styles.optionRow}>
              {ratingOptions.map((option) => {
                const isSelected = qualityChecklist.cameraSetupQuality === option;
                return (
                  <TouchableOpacity
                    key={`camera-${option}`}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => updateChecklistField('cameraSetupQuality', option)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.checklistLabel}>Reaction Clarity</Text>
            <View style={styles.optionRow}>
              {ratingOptions.map((option) => {
                const isSelected = qualityChecklist.reactionClarity === option;
                return (
                  <TouchableOpacity
                    key={`reaction-${option}`}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => updateChecklistField('reactionClarity', option)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analyst Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add a short analyst/reviewer note for this session"
              value={analystNotes}
              onChangeText={setAnalystNotes}
              multiline
            />
          </View>

          <View style={styles.card}>
            <View style={styles.jsonHeader}>
              <Text style={styles.cardTitle}>Session JSON Preview</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyJson}>
                <Text style={styles.copyButtonText}>Copy JSON</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator>
              <Text style={styles.jsonText}>{exportJson}</Text>
            </ScrollView>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Challenge Summary</Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Challenge ID:</Text> {challenge.id}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Created At:</Text> {new Date(challenge.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Challenge:</Text> {challenge.challengeName}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Opponent:</Text> {challenge.opponent}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Cue-hiding method:</Text> {challenge.occlusionMethod}
            </Text>
          </View>

          {shooterUpload && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shooter Upload Summary</Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Submitted At:</Text> {new Date(shooterUpload.submittedAt).toLocaleString()}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Camera Angle:</Text> {shooterUpload.cameraAngle}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Shot Notes:</Text> {shooterUpload.shotNotes || 'None provided'}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Video Selected:</Text> {shooterUpload.videoSelected ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Video Filename:</Text> {shooterUpload.videoFilename}
              </Text>
            </View>
          )}

          {goalkeeperResponse && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Goalkeeper Response Summary</Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Submitted At:</Text> {new Date(goalkeeperResponse.submittedAt).toLocaleString()}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Reaction Direction:</Text> {goalkeeperResponse.reactionDirection}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Timing Note:</Text> {goalkeeperResponse.reactionTimingNote || 'None provided'}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Save Result:</Text> {goalkeeperResponse.saveAttemptResult}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Response Video Selected:</Text> {goalkeeperResponse.responseVideoSelected ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Video Filename:</Text> {goalkeeperResponse.videoFilename}
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sample Output</Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Shot Direction:</Text> Top right
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Shot Height:</Text> High
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Reaction Side:</Text> Right
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Reaction Time:</Text> 0.41s
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Outcome:</Text> Late save attempt
            </Text>
          </View>

          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleGoHome}>
              <Text style={styles.actionButtonSecondaryText}>Go Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonPrimary} onPress={handleStartNewChallenge}>
              <Text style={styles.actionButtonPrimaryText}>Start New Challenge</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonDanger} onPress={handleResetSession}>
              <Text style={styles.actionButtonDangerText}>Reset Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  scrollContent: { paddingBottom: 32 },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#4B5563', marginBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  row: { fontSize: 16, color: '#374151', marginBottom: 12 },
  label: { fontWeight: '700', color: '#111827' },
  notesInput: {
    minHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    textAlignVertical: 'top',
  },
  checklistLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#111827',
  },
  optionText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  scoreNote: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  jsonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jsonText: {
    fontSize: 12,
    color: '#1F2937',
    fontFamily: 'Courier',
    lineHeight: 18,
  },
  copyButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBar: {
    marginTop: 8,
    gap: 12,
  },
  actionButtonPrimary: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonDanger: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonDangerText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '700',
  },
});