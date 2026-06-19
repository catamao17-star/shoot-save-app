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
import { useChallenge } from '../context/ChallengeContext';
import ProgressSteps from '../components/ProgressSteps';

type Props = {
  navigation: any;
};

export default function ResultsScreen({ navigation }: Props) {
  const { currentSession, resetSession, setAnalystNotes } = useChallenge();

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

  const { challenge, shooterUpload, goalkeeperResponse, status, analystNotes } = currentSession;

  const isShooterComplete = !!shooterUpload;
  const isGoalkeeperComplete = !!goalkeeperResponse;
  const isRecordComplete = status === 'complete';

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
            <Text style={styles.cardTitle}>Export-Ready Record Summary</Text>
            <Text style={styles.codeLine}>{'{'}</Text>
            <Text style={styles.codeLine}>{'  '}challengeId: "{challenge.id}",</Text>
            <Text style={styles.codeLine}>{'  '}createdAt: "{challenge.createdAt}",</Text>
            <Text style={styles.codeLine}>{'  '}status: "{status}",</Text>
            <Text style={styles.codeLine}>{'  '}analystNotes: "{analystNotes || 'None'}",</Text>
            <Text style={styles.codeLine}>{'  '}challengeName: "{challenge.challengeName}",</Text>
            <Text style={styles.codeLine}>{'  '}opponent: "{challenge.opponent}",</Text>
            <Text style={styles.codeLine}>{'  '}occlusionMethod: "{challenge.occlusionMethod}",</Text>
            <Text style={styles.codeLine}>{'  '}shooterSubmitted: {isShooterComplete ? 'true' : 'false'},</Text>
            <Text style={styles.codeLine}>{'  '}goalkeeperSubmitted: {isGoalkeeperComplete ? 'true' : 'false'},</Text>

            {shooterUpload && (
              <>
                <Text style={styles.codeLine}>{'  '}shooterUpload: {'{'}</Text>
                <Text style={styles.codeLine}>{'    '}submittedAt: "{shooterUpload.submittedAt}",</Text>
                <Text style={styles.codeLine}>{'    '}cameraAngle: "{shooterUpload.cameraAngle}",</Text>
                <Text style={styles.codeLine}>{'    '}shotNotes: "{shooterUpload.shotNotes || 'None'}",</Text>
                <Text style={styles.codeLine}>{'    '}videoSelected: {shooterUpload.videoSelected ? 'true' : 'false'},</Text>
                <Text style={styles.codeLine}>{'  '}{'},'}</Text>
              </>
            )}

            {goalkeeperResponse && (
              <>
                <Text style={styles.codeLine}>{'  '}goalkeeperResponse: {'{'}</Text>
                <Text style={styles.codeLine}>{'    '}submittedAt: "{goalkeeperResponse.submittedAt}",</Text>
                <Text style={styles.codeLine}>{'    '}reactionDirection: "{goalkeeperResponse.reactionDirection}",</Text>
                <Text style={styles.codeLine}>{'    '}reactionTimingNote: "{goalkeeperResponse.reactionTimingNote || 'None'}",</Text>
                <Text style={styles.codeLine}>{'    '}saveAttemptResult: "{goalkeeperResponse.saveAttemptResult}",</Text>
                <Text style={styles.codeLine}>{'    '}responseVideoSelected: {goalkeeperResponse.responseVideoSelected ? 'true' : 'false'},</Text>
                <Text style={styles.codeLine}>{'  '}{'}'}</Text>
              </>
            )}

            <Text style={styles.codeLine}>{'}'}</Text>
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
  codeLine: { fontSize: 13, color: '#1F2937', fontFamily: 'Courier', marginBottom: 4 },
  notesInput: {
    minHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    textAlignVertical: 'top',
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