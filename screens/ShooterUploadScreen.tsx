import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useChallenge } from '../context/ChallengeContext';
import type { CameraAngle } from '../types/challenge';

type Props = NativeStackScreenProps<RootStackParamList, 'ShooterUpload'>;

const cameraAngleOptions: CameraAngle[] = ['Front', 'Side', 'Behind Goal', 'Custom'];

export default function ShooterUploadScreen({ navigation }: Props) {
  const { currentChallenge } = useChallenge();
  const [selectedCameraAngle, setSelectedCameraAngle] = useState<CameraAngle>('Front');
  const [shotNotes, setShotNotes] = useState('');
  const [videoSelected, setVideoSelected] = useState(false);

  if (!currentChallenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Shooter Upload</Text>
          <Text style={styles.subtitle}>No challenge found. Please create a challenge first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleContinue = () => {
    if (!videoSelected) {
      Alert.alert('Missing shot video', 'Please mark the shot video as selected before continuing.');
      return;
    }

    navigation.navigate('GoalkeeperResponse');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Shooter Upload</Text>
        <Text style={styles.subtitle}>
          This screen represents where the shooter records or uploads the shot and captures basic metadata for version 1.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Challenge Setup</Text>
          <Text style={styles.cardText}>Challenge: {currentChallenge.challengeName}</Text>
          <Text style={styles.cardText}>Opponent: {currentChallenge.opponent}</Text>
          <Text style={styles.cardText}>
            Cue-hiding method: {currentChallenge.occlusionMethod}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shooter Input</Text>

          <Text style={styles.label}>Camera Angle</Text>
          <View style={styles.optionRow}>
            {cameraAngleOptions.map((option) => {
              const isSelected = selectedCameraAngle === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => setSelectedCameraAngle(option)}
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

          <Text style={styles.label}>Shot Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Example: right-footed shot, hidden by black curtain, aiming high right"
            value={shotNotes}
            onChangeText={setShotNotes}
            multiline
          />

          <Text style={styles.label}>Shot Video</Text>
          <TouchableOpacity
            style={[styles.videoButton, videoSelected && styles.videoButtonSelected]}
            onPress={() => setVideoSelected((prev) => !prev)}
          >
            <Text
              style={[
                styles.videoButtonText,
                videoSelected && styles.videoButtonTextSelected,
              ]}
            >
              {videoSelected ? 'Shot Video Selected' : 'Mark Shot Video as Selected'}
            </Text>
          </TouchableOpacity>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Current Shooter Metadata</Text>
            <Text style={styles.summaryText}>Camera angle: {selectedCameraAngle}</Text>
            <Text style={styles.summaryText}>
              Shot notes: {shotNotes.trim() ? shotNotes : 'None yet'}
            </Text>
            <Text style={styles.summaryText}>
              Video selected: {videoSelected ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue to Goalkeeper Response</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
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