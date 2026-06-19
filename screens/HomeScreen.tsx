import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { fetchSessionsFromSupabase } from '../services/sessionService';
import { useChallenge } from '../context/ChallengeContext';

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  const {
    currentSession,
    sessionHistory,
    setSessionHistory,
    loadSessionFromHistory,
    loadSessionObject,
    resetSession,
    isSyncing,
    syncError,
    setIsSyncing,
    setSyncError,
  } = useChallenge();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        setUserEmail(null);
        return;
      }

      setUserEmail(user?.email ?? null);
    } catch {
      setUserEmail(null);
    }
  };

  const fetchBackendSessions = async (showAlert = false) => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const parsedSessions = await fetchSessionsFromSupabase(25);

      setSessionHistory(parsedSessions);

      if (!currentSession && parsedSessions.length > 0) {
        loadSessionObject(parsedSessions[0]);
      }

      if (showAlert) {
        Alert.alert('Loaded', `${parsedSessions.length} session(s) loaded from Supabase.`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while loading sessions.';
      setSyncError(message);

      if (showAlert) {
        Alert.alert('Load failed', message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchBackendSessions(false);
  }, []);

  const dashboardStats = useMemo(() => {
    const total = sessionHistory.length;
    const complete = sessionHistory.filter((session) => session.status === 'complete').length;
    const created = sessionHistory.filter((session) => session.status === 'created').length;
    const shooterSubmitted = sessionHistory.filter(
      (session) => session.status === 'shooter_submitted'
    ).length;
    const goalkeeperSubmitted = sessionHistory.filter(
      (session) => session.status === 'goalkeeper_submitted'
    ).length;

    const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;

    const latestSession =
      sessionHistory.length > 0
        ? [...sessionHistory].sort(
            (a, b) =>
              new Date(b.challenge.createdAt).getTime() - new Date(a.challenge.createdAt).getTime()
          )[0]
        : null;

    return {
      total,
      complete,
      created,
      shooterSubmitted,
      goalkeeperSubmitted,
      completionRate,
      latestSession,
    };
  }, [sessionHistory]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert('Sign out failed', error.message);
        return;
      }

      resetSession();
      setSessionHistory([]);
      setUserEmail(null);
    } catch {
      Alert.alert('Sign out failed', 'Unexpected error while signing out.');
    } finally {
      setIsSigningOut(false);
    }
  };

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
    await fetchBackendSessions(true);
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

          <View style={styles.userCard}>
            <Text style={styles.userCardTitle}>Connected Account</Text>
            <Text style={styles.userCardText}>{userEmail ?? 'No user email found'}</Text>

            <TouchableOpacity
              style={[styles.signOutButton, isSigningOut && styles.buttonDisabled]}
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              <Text style={styles.signOutButtonText}>
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Session Dashboard</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{dashboardStats.total}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{dashboardStats.complete}</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{dashboardStats.completionRate}%</Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{dashboardStats.created}</Text>
                <Text style={styles.statLabel}>Created Only</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{dashboardStats.shooterSubmitted}</Text>
                <Text style={styles.statLabel}>Shooter Done</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{dashboardStats.goalkeeperSubmitted}</Text>
                <Text style={styles.statLabel}>Goalkeeper Done</Text>
              </View>
            </View>

            <View style={styles.latestBox}>
              <Text style={styles.latestTitle}>Latest Challenge</Text>
              <Text style={styles.latestText}>
                {dashboardStats.latestSession
                  ? dashboardStats.latestSession.challenge.challengeName
                  : 'No sessions yet'}
              </Text>
              {dashboardStats.latestSession && (
                <Text style={styles.latestSubtext}>
                  {dashboardStats.latestSession.challenge.opponent} ·{' '}
                  {new Date(
                    dashboardStats.latestSession.challenge.createdAt
                  ).toLocaleString()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Version 1 Goal</Text>
            <Text style={styles.cardText}>
              Validate the workflow: shooter records a shot, goalkeeper responds later,
              and the app stores the challenge flow for future data collection.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.loadButton, isSyncing && styles.buttonDisabled]}
            onPress={handleLoadFromSupabase}
            disabled={isSyncing}
          >
            <Text style={styles.loadButtonText}>
              {isSyncing ? 'Syncing...' : 'Refresh from Supabase'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sessionsButton}
            onPress={() => navigation.navigate('MySessions')}
          >
            <Text style={styles.sessionsButtonText}>Open My Sessions</Text>
          </TouchableOpacity>

          {syncError && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Backend Error</Text>
              <Text style={styles.errorText}>{syncError}</Text>
            </View>
          )}

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
              <Text style={styles.historyEmpty}>
                {isSyncing ? 'Loading sessions...' : 'No completed sessions yet.'}
              </Text>
            ) : (
              sessionHistory.slice(0, 5).map((session) => (
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  userCardText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 14,
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  latestBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  latestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  latestText: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
  latestSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
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
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#B91C1C',
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
  sessionsButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  sessionsButtonText: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
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