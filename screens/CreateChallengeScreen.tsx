import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import type { Challenge } from '../types/challenge';
import { useChallenge } from '../context/ChallengeContext';
import ProgressSteps from '../components/ProgressSteps';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateChallenge'>;

function generateChallengeId() {
  return `CH-${Date.now()}`;
}

export default function CreateChallengeScreen({ navigation }: Props) {
  const [challengeName, setChallengeName] = useState('');
  const [opponent, setOpponent] = useState('');
  const [occlusionMethod, setOcclusionMethod] = useState('');
  const { createSession } = useChallenge();

  const handleContinue = () => {
    if (!challengeName.trim() || !opponent.trim() || !occlusionMethod.trim()) {
      Alert.alert('Missing information', 'Please fill in all fields before continuing.');
      return;
    }

    const challenge: Challenge = {
      id: generateChallengeId(),
      createdAt: new Date().toISOString(),
      challengeName: challengeName.trim(),
      opponent: opponent.trim(),
      occlusionMethod: occlusionMethod.trim(),
    };

    createSession(challenge);
    navigation.navigate('ShooterUpload');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressSteps currentStep={1} />

        <Text style={styles.title}>Create Challenge</Text>
        <Text style={styles.subtitle}>
          Set up the first version of the remote shooter vs goalkeeper flow.
        </Text>

        <Text style={styles.label}>Challenge Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Weekend Save Challenge"
          value={challengeName}
          onChangeText={setChallengeName}
        />

        <Text style={styles.label}>Opponent</Text>
        <TextInput
          style={styles.input}
          placeholder="Dad"
          value={opponent}
          onChangeText={setOpponent}
        />

        <Text style={styles.label}>Cue-Hiding Method</Text>
        <TextInput
          style={styles.input}
          placeholder="Black curtain"
          value={occlusionMethod}
          onChangeText={setOcclusionMethod}
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue to Shooter Upload</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});