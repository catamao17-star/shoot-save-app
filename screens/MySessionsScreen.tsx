// screens/MySessionsScreen.tsx
import { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  deleteSessionFromSupabase,
  fetchAllSessionsFromSupabase,
} from '../services/sessionService';
import { useChallenge } from '../context/ChallengeContext';
import type { ChallengeSession } from '../types/session';

type Props = {
  navigation: any;
};

export default function MySessionsScreen({ navigation }: Props) {
  const { currentSession, loadSessionObject, setSessionHistory, resetSession } = useChallenge();
  const [sessions, setSessions] = useState<ChallengeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingRemoteId, setDeletingRemoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const data = await fetchAllSessionsFromSupabase();
      setSessions(data);
      setSessionHistory(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error while loading sessions.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions(false);
  }, []);

  const handleOpenSession = (session: ChallengeSession) => {
    loadSessionObject(session);
    navigation.navigate('Results');
  };

  const handleRefresh = async () => {
    await loadSessions(true);
  };

  const handleDeleteSession = (session: ChallengeSession) => {
    if (!session.remoteId) {
      Alert.alert('Delete failed', 'This session has no remote id.');
      return;
    }

    Alert.alert(
      'Delete session',
      `Are you sure you want to delete "${session.challenge.challengeName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingRemoteId(session.remoteId!);

              await deleteSessionFromSupabase(session.remoteId!);

              const updatedSessions = sessions.filter(
                (item) => item.remoteId !== session.remoteId
              );

              setSessions(updatedSessions);
              setSessionHistory(updatedSessions);

              if (currentSession?.remoteId === session.remoteId) {
                resetSession();
              }

              Alert.alert('Deleted', 'Session deleted from Supabase.');
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Unexpected error while deleting session.';
              Alert.alert('Delete failed', message);
            } finally {
              setDeletingRemoteId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.content}>
          <Text style={styles.title}>My Sessions</Text>
          <Text style={styles.subtitle}>
            Sessions loaded from your Supabase account.
          </Text>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Load Error</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading sessions...</Text>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No sessions found for this account yet.</Text>
            </View>
          ) : (
            sessions.map((session) => {
              const isDeleting = deletingRemoteId === session.remoteId;

              return (
                <View
                  key={`${session.remoteId ?? session.challenge.id}`}
                  style={styles.sessionCard}
                >
                  <TouchableOpacity onPress={() => handleOpenSession(session)}>
                    <Text style={styles.sessionTitle}>{session.challenge.challengeName}</Text>
                    <Text style={styles.sessionText}>Opponent: {session.challenge.opponent}</Text>
                    <Text style={styles.sessionText}>Status: {session.status}</Text>
                    <Text style={styles.sessionText}>
                      Remote ID: {session.remoteId ?? 'Not synced'}
                    </Text>
                    <Text style={styles.sessionText}>
                      Created: {new Date(session.challenge.createdAt).toLocaleString()}
                    </Text>
                    <Text style={styles.openText}>Tap to open session</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
                    onPress={() => handleDeleteSession(session)}
                    disabled={isDeleting}
                  >
                    <Text style={styles.deleteButtonText}>
                      {isDeleting ? 'Deleting...' : 'Delete Session'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  scrollContent: { paddingBottom: 32 },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#4B5563', marginBottom: 24 },
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  openText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  deleteButtonText: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  homeButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  homeButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
});