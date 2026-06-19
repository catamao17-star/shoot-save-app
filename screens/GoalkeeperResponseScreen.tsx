import { useState } from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useChallenge } from '../context/ChallengeContext';
import type {
  GoalkeeperResponseData,
  ReactionDirection,
  SaveAttemptResult,
} from '../types/challenge';
import ProgressSteps from '../components/ProgressSteps';
import {
  pickVideoFromLibrary,
  uploadSessionVideoToSupabase,
} from '../services/storageService';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalkeeperResponse'>;

const reactionDirectionOptions: ReactionDirection[] = ['Left', 'Center', 'Right'];
const saveAttemptResultOptions: SaveAttemptResult[] = ['Saved', 'Missed', 'Late Reaction'];

export default function GoalkeeperResponseScreen({ navigation }: Props) {
  const { currentSession, setGoalkeeperResponseData } = useChallenge();
  const [reactionDirection, setReactionDirection] = useState<ReactionDirection>('Center');
  const [reactionTimingNote, setReactionTimingNote] = useState('');
  const [saveAttemptResult, setSaveAttemptResult] =
    useState<SaveAttemptResult>('Late Reaction');
  const [responseVideoSelected, setResponseVideoSelected] = useState(false);
  const [videoFilename, setVideoFilename] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Goalkeeper Response</Text>
          <Text style={styles.subtitle}>No challenge found. Please create a challenge first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const challenge = currentSession.challenge;
  const shooterUploadData = currentSession.shooterUpload;

  const handlePickAndUploadVideo = async () => {
    try {
      setIsUploadingVideo(true);

      const uri = await pickVideoFromLibrary();

      if (!uri) {
        return;
      }

      const uploaded = await uploadSessionVideoToSupabase({
        challengeId: challenge.id,
        role: 'goalkeeper',
        localUri: uri,
      });

      setResponseVideoSelected(true);
      setVideoFilename(uploaded.path);

      Alert.alert('Uploaded', 'Goalkeeper video uploaded to Supabase Storage.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while uploading video.';
      Alert.alert('Upload failed', message);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleContinue = () => {
    if (!responseVideoSelected || !videoFilename.trim()) {
      Alert.alert(
        'Missing response video',
        'Please upload the goalkeeper response video before continuing.'
      );
      return;
    }

    const goalkeeperData: GoalkeeperResponseData = {
      reactionDirection,
      reactionTimingNote: reactionTimingNote.trim(),
      saveAttemptResult,
      responseVideoSelected,
      videoFilename,
      submittedAt: new Date().toISOString(),
    };

    setGoalkeeperResponseData(goalkeeperData);
    navigation.navigate('Results');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ProgressSteps currentStep={3} />

          <Text style={styles.title}>Goalkeeper Response</Text>
          <Text style={styles.subtitle}>
            Upload the goalkeeper response video and save real media metadata for the session.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Challenge Setup</Text>
            <Text style={styles.cardText}>Challenge ID: {challenge.id}</Text>
            <Text style={styles.cardText}>
              Created At: {new Date(challenge.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.cardText}>Challenge: {challenge.challengeName}</Text>
            <Text style={styles.cardText}>Opponent: {challenge.opponent}</Text>
            <Text style={styles.cardText}>
              Cue-hiding method: {challenge.occlusionMethod}
            </Text>
          </View>

          {shooterUploadData && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shooter Metadata</Text>
              <Text style={styles.cardText}>Camera angle: {shooterUploadData.cameraAngle}</Text>
              <Text style={styles.cardText}>
                Shot notes: {shooterUploadData.shotNotes || 'None provided'}
              </Text>
              <Text style={styles.cardText}>
                Video uploaded: {shooterUploadData.videoSelected ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.cardText}>
                Video path: {shooterUploadData.videoFilename || 'None provided'}
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Goalkeeper Metadata</Text>

            <Text style={styles.label}>Reaction Direction</Text>
            <View style={styles.optionRow}>
              {reactionDirectionOptions.map((option) => {
                const isSelected = reactionDirection === option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => setReactionDirection(option)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        isSelected && styles.optionButtonTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Reaction Timing Note</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Example: reacted slightly late, shifted right after ball release"
              value={reactionTimingNote}
              onChangeText={setReactionTimingNote}
              multiline
            />

            <Text style={styles.label}>Save Attempt Result</Text>
            <View style={styles.optionRow}>
              {saveAttemptResultOptions.map((option) => {
                const isSelected = saveAttemptResult === option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => setSaveAttemptResult(option)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        isSelected && styles.optionButtonTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Response Video</Text>
            <TouchableOpacity
              style={[styles.videoButton, isUploadingVideo && styles.videoButtonDisabled]}
              onPress={handlePickAndUploadVideo}
              disabled={isUploadingVideo}
            >
              <Text style={styles.videoButtonText}>
                {isUploadingVideo ? 'Uploading video...' : 'Pick and Upload Goalkeeper Video'}
              </Text>
            </TouchableOpacity>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Current Goalkeeper Metadata</Text>
              <Text style={styles.summaryText}>Reaction direction: {reactionDirection}</Text>
              <Text style={styles.summaryText}>
                Timing note: {reactionTimingNote.trim() ? reactionTimingNote : 'None yet'}
              </Text>
              <Text style={styles.summaryText}>Result: {saveAttemptResult}</Text>
              <Text style={styles.summaryText}>
                Video uploaded: {responseVideoSelected ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.summaryText}>
                Video path: {videoFilename || 'None yet'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue to Results</Text>
          </TouchableOpacity>
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
  cardText: { fontSize: 15, color: '#4B5563', marginBottom: 6 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 14,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  optionButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  videoButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  videoButtonDisabled: {
    opacity: 0.6,
  },
  videoButtonText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});