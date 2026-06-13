import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export default function ResultsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Results</Text>
        <Text style={styles.subtitle}>
          Example version 1 output for the challenge.
        </Text>

        <View style={styles.card}>
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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