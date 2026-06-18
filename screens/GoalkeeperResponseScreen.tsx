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

type Props = NativeStackScreenProps<RootStackParamList, 'GoalkeeperResponse'>;

const reactionDirectionOptions: ReactionDirection[] = ['Left', 'Center', 'Right'];
const saveAttemptResultOptions: SaveAttemptResult[] = ['Saved', 'Missed', 'Late Reaction'];

export default function GoalkeeperResponseScreen({ navigation }: Props) {
  const { currentChallenge, shooterUploadData, setGoalkeeperResponseData } = useChallenge();
  const [reactionDirection, setReactionDirection] = useState<ReactionDirection>('Center');
  const [reactionTimingNote, setReactionTimingNote] = useState('');
  const [saveAttemptResult, setSaveAttemptResult] =
    useState<SaveAttemptResult>('Late Reaction');
  const [responseVideoSelected, setResponseVideoSelected] = useState(false);

  if (!currentChallenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Goalkeeper Response</Text>
          <Text style={styles.subtitle}>No challenge found. Please create a challenge first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleContinue = () => {
    if (!responseVideoSelected) {
      Alert.alert(
        'Missing response video',
        'Please mark the goalkeeper response video as selected before continuing.'
      );
      return;
    }

    const goalkeeperData: GoalkeeperResponseData = {
      submittedAt: new Date().toISOString(),
      reactionDirection,
      reactionTimingNote: reactionTimingNote.trim(),
      saveAttemptResult,
      responseVideoSelected,
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
            This screen represents the goalkeeper watching the challenge and recording a save attempt.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Challenge Setup</Text>
            <Text style={styles.cardText}>Challenge ID: {currentChallenge.id}</Text>
            <Text style={styles.cardText}>
              Created At: {new Date(currentChallenge.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.cardText}>Challenge: {currentChallenge.challengeName}</Text>
            <Text style={styles.cardText}>Opponent: {currentChallenge.opponent}</Text>
            <Text style={styles.cardText}>
              Cue-hiding method: {currentChallenge.occlusionMethod}
            </Text>
          </View>

          {shooterUploadData && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shooter Metadata</Text>
              <Text style={styles.cardText}>
                Submitted At: {new Date(shooterUploadData.submittedAt).toLocaleString()}
              </Text>
              <Text style={styles.cardText}>Camera angle: {shooterUploadData.cameraAngle}</Text>
              <Text style={styles.cardText}>
                Shot notes: {shooterUploadData.shotNotes || 'None provided'}
              </Text>
              <Text style={styles.cardText}>
                Video selected: {shooterUploadData.videoSelected ? 'Yes' : 'No'}
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
                      style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}
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
                      style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Response Video</Text>
            <TouchableOpacity
              style={[styles.videoButton, responseVideoSelected && styles.videoButtonSelected]}
              onPress={() => setResponseVideoSelected((prev) => !prev)}
            >
              <Text
                style={[
                  styles.videoButtonText,
                  responseVideoSelected && styles.videoButtonTextSelected,
                ]}
              >
                {responseVideoSelected
                  ? 'Goalkeeper Response Video Selected'
                  : 'Mark Goalkeeper Response Video as Selected'}
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
                Response video selected: {responseVideoSelected ? 'Yes' : 'No'}
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
  cardText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 6,
  },
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
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  videoButtonSelected: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  videoButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  videoButtonTextSelected: {
    color: '#166534',
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