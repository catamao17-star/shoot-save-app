import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ route }: Props) {
  const { challenge } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Results</Text>
        <Text style={styles.subtitle}>
          Example version 1 output for the challenge.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Challenge Summary</Text>
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