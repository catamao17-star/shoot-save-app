import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  navigation: any;
};

export default function CreateChallengeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Challenge</Text>
        <Text style={styles.subtitle}>
          Set up the first version of the remote shooter vs goalkeeper flow.
        </Text>

        <Text style={styles.label}>Challenge Name</Text>
        <TextInput style={styles.input} placeholder="Weekend Save Challenge" />

        <Text style={styles.label}>Opponent</Text>
        <TextInput style={styles.input} placeholder="Dad" />

        <Text style={styles.label}>Cue-Hiding Method</Text>
        <TextInput style={styles.input} placeholder="Black curtain" />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ShooterUpload')}
        >
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