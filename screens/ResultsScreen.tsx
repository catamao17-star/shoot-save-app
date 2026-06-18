import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useChallenge } from '../context/ChallengeContext';
import ProgressSteps from '../components/ProgressSteps';

export default function ResultsScreen() {
  const { currentChallenge, shooterUploadData, goalkeeperResponseData } = useChallenge();

  if (!currentChallenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle}>No challenge found. Please create a challenge first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ProgressSteps currentStep={4} />

          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle}>
            Example version 1 output for the challenge.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Challenge Summary</Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Challenge ID:</Text> {currentChallenge.id}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Created At:</Text>{' '}
              {new Date(currentChallenge.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Challenge:</Text> {currentChallenge.challengeName}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Opponent:</Text> {currentChallenge.opponent}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Cue-hiding method:</Text> {currentChallenge.occlusionMethod}
            </Text>
          </View>

          {shooterUploadData && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shooter Upload Summary</Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Submitted At:</Text>{' '}
                {new Date(shooterUploadData.submittedAt).toLocaleString()}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Camera Angle:</Text> {shooterUploadData.cameraAngle}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Shot Notes:</Text>{' '}
                {shooterUploadData.shotNotes || 'None provided'}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Video Selected:</Text>{' '}
                {shooterUploadData.videoSelected ? 'Yes' : 'No'}
              </Text>
            </View>
          )}

          {goalkeeperResponseData && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Goalkeeper Response Summary</Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Submitted At:</Text>{' '}
                {new Date(goalkeeperResponseData.submittedAt).toLocaleString()}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Reaction Direction:</Text>{' '}
                {goalkeeperResponseData.reactionDirection}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Timing Note:</Text>{' '}
                {goalkeeperResponseData.reactionTimingNote || 'None provided'}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Save Result:</Text>{' '}
                {goalkeeperResponseData.saveAttemptResult}
              </Text>
              <Text style={styles.row}>
                <Text style={styles.label}>Response Video Selected:</Text>{' '}
                {goalkeeperResponseData.responseVideoSelected ? 'Yes' : 'No'}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  label: {
    fontWeight: '700',
    color: '#111827',
  },
});