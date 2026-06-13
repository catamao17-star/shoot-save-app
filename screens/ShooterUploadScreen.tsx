import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useChallenge } from '../context/ChallengeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ShooterUpload'>;

export default function ShooterUploadScreen({ navigation }: Props) {
  const { currentChallenge } = useChallenge();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Shooter Upload</Text>
        <Text style={styles.subtitle}>
          In version 1, this screen represents where the shooter records or uploads the shot.
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
          <Text style={styles.cardTitle}>Planned input</Text>
          <Text style={styles.cardText}>• Shot video</Text>
          <Text style={styles.cardText}>• Camera angle</Text>
          <Text style={styles.cardText}>• Cue-hiding setup</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GoalkeeperResponse')}
        >
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
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});