import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalkeeperResponse'>;

export default function GoalkeeperResponseScreen({ navigation, route }: Props) {
  const { challengeName, opponent, occlusionMethod } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Goalkeeper Response</Text>
        <Text style={styles.subtitle}>
          This screen represents the goalkeeper watching the challenge and recording a save attempt.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Challenge Setup</Text>
          <Text style={styles.cardText}>Challenge: {challengeName}</Text>
          <Text style={styles.cardText}>Opponent: {opponent}</Text>
          <Text style={styles.cardText}>Cue-hiding method: {occlusionMethod}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Version 1 data goal</Text>
          <Text style={styles.cardText}>• Reaction direction</Text>
          <Text style={styles.cardText}>• Reaction timing</Text>
          <Text style={styles.cardText}>• Save or miss</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('Results', {
              challengeName,
              opponent,
              occlusionMethod,
            })
          }
        >
          <Text style={styles.buttonText}>Continue to Results</Text>
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