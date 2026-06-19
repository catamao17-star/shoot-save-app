import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useChallenge } from '../context/ChallengeContext';
import type { ChallengeSession } from '../types/session';

type Props = {
  navigation: any;
};

type SessionRow = {
  id: number;
  created_at: string;
  challenge_id: string;
  session_status: string;
  completeness_score: number;
  payload: any;
};

export default function HomeScreen({ navigation }: Props) {
  const {
    currentSession,
    sessionHistory,
    setSessionHistory,
    loadSessionFromHistory,
    loadSessionObject,
    resetSession,
  } = useChallenge();

  const fetchSessionsFromSupabase = async (showAlert = false) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        if (showAlert) {
          Alert.alert('Load failed', error.message);
        }
        return;
      }

      const parsedSessions: ChallengeSession[] = ((data ?? []) as SessionRow[])
        .map((row) => row.payload as ChallengeSession)
        .filter(Boolean);

      setSessionHistory(parsedSessions);

      if (!currentSession && parsedSessions.length > 0) {
        loadSessionObject(parsedSessions[0]);
      }

      if (showAlert) {
        Alert.alert('Loaded', `${parsedSessions.length} session(s) loaded from Supabase.`);
      }
    } catch (error) {
      if (showAlert) {
        Alert.alert('Load failed', 'Unexpected error while loading sessions.');
      }
    }
  };

  useEffect(() => {
    fetchSessionsFromSupabase(false);
  }, []);

  const handleResetChallenge = () => {
    Alert.alert(
      'Reset current challenge',
      'Are you sure you want to clear the current challenge and all related data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSession();
          },
        },
      ]
    );
  };

  const handleResumeSession = () => {
    if (!currentSession) return;

    if (currentSession.status === 'created') {
      navigation.navigate('ShooterUpload');
      return;
    }

    if (currentSession.status === 'shooter_submitted') {
      navigation.navigate('GoalkeeperResponse');
      return;
    }

    navigation.navigate('Results');
  };

  const handleOpenHistorySession = (sessionId: string) => {
    loadSessionFromHistory(sessionId);
    navigation.navigate('Results');
  };

  const handleLoadFromSupabase = async () => {
    await fetchSessionsFromSupabase(true);
  };

  const challenge = currentSession?.challenge;
  const shooterUpload = currentSession?.shooterUpload;
  const goalkeeperResponse = currentSession?.goalkeeperResponse;
  const sessionStatus = currentSession?.status;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Shoot & Save</Text>
          <Text style={styles.subtitle}>
            Remote soccer challenge prototype for shooter vs goalkeeper
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Version 1 Goal</Text>
            <Text style={styles.cardText}>
              Validate the workflow: shooter records a shot, goalkeeper responds later,
              and the app stores the challenge flow for future data collection.
            </Text>
          </View>

          <TouchableOpacity style={styles.loadButton} onPress={handleLoadFromSupabase}>
            <Text style={styles.loadButtonText}>Refresh from Supabase</Text>
          </TouchableOpacity>

          {challenge && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Challenge</Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Challenge ID:</Text> {challenge.id}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Created At:</Text>{' '}
                {new Date(challenge.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Challenge:</Text> {challenge.challengeName}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Opponent:</Text> {challenge.opponent}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Cue-hiding method:</Text> {challenge.occlusionMethod}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Shooter data:</Text>{' '}
                {shooterUpload ? 'Completed' : 'Not completed'}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Goalkeeper data:</Text>{' '}
                {goalkeeperResponse ? 'Completed' : 'Not completed'}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Session status:</Text> {sessionStatus}
              </Text>
            </View>
          )}

          {challenge && (
            <TouchableOpacity style={styles.resumeButton} onPress={handleResumeSession}>
              <Text style={styles.resumeButtonText}>Resume Current Session</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateChallenge')}
          >
            <Text style={styles.primaryButtonText}>
              {challenge ? 'Create New Challenge' : 'Create Challenge'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Results')}
          >
            <Text style={styles.secondaryButtonText}>View Current Results</Text>
          </TouchableOpacity>

          {challenge && (
            <TouchableOpacity style={styles.resetButton} onPress={handleResetChallenge}>
              <Text style={styles.resetButtonText}>Reset Challenge</Text>
            </TouchableOpacity>
          )}

          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent Session History</Text>

            {sessionHistory.length === 0 ? (
              <Text style={styles.historyEmpty}>No completed sessions yet.</Text>
            ) : (
              sessionHistory.slice(0, 10).map((session) => (
                <TouchableOpacity
                  key={session.challenge.id}
                  style={styles.historyItem}
                  onPress={() => handleOpenHistorySession(session.challenge.id)}
                >
                  <Text style={styles.historyItemTitle}>{session.challenge.challengeName}</Text>
                  <Text style={styles.historyItemText}>
                    Opponent: {session.challenge.opponent}
                  </Text>
                  <Text style={styles.historyItemText}>Status: {session.status}</Text>
                  <Text style={styles.historyItemText}>
                    Created: {new Date(session.challenge.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.historyOpenText}>Tap to open session</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  scrollContent: { paddingBottom: 32 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: { fontSize: 36, fontWeight: '800', color: '#111827', marginBottom: 12 },
  subtitle: { fontSize: 16, lineHeight: 24, color: '#4B5563', marginBottom: 28 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  cardText: { fontSize: 15, lineHeight: 22, color: '#4B5563', marginBottom: 4 },
  label: { fontWeight: '700', color: '#111827' },
  loadButton: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  loadButtonText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '700',
  },
  resumeButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  resumeButtonText: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  secondaryButtonText: { color: '#111827', fontSize: 16, fontWeight: '700' },
  resetButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: { color: '#B91C1C', fontSize: 16, fontWeight: '700' },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  historyEmpty: {
    fontSize: 15,
    color: '#6B7280',
  },
  historyItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  historyItemText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  historyOpenText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 6,
  },
});