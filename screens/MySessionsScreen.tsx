import { useEffect, useMemo, useState } from 'react';
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
import type { ChallengeSession, SessionStatus } from '../types/session';

type Props = {
  navigation: any;
};

type FilterOption = 'all' | SessionStatus;
type SortOption = 'newest' | 'oldest';

const filterOptions: { label: string; value: FilterOption }[] = [
  { label: 'All', value: 'all' },
  { label: 'Created', value: 'created' },
  { label: 'Shooter', value: 'shooter_submitted' },
  { label: 'Goalkeeper', value: 'goalkeeper_submitted' },
  { label: 'Complete', value: 'complete' },
];

export default function MySessionsScreen({ navigation }: Props) {
  const { currentSession, loadSessionObject, setSessionHistory, resetSession } = useChallenge();
  const [sessions, setSessions] = useState<ChallengeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingRemoteId, setDeletingRemoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [selectedSort, setSelectedSort] = useState<SortOption>('newest');

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

  const visibleSessions = useMemo(() => {
    let result = [...sessions];

    if (selectedFilter !== 'all') {
      result = result.filter((session) => session.status === selectedFilter);
    }

    result.sort((a, b) => {
      const timeA = new Date(a.challenge.createdAt).getTime();
      const timeB = new Date(b.challenge.createdAt).getTime();

      return selectedSort === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [sessions, selectedFilter, selectedSort]);

  const handleOpenSession = (session: ChallengeSession) => {
    loadSessionObject(session);
    navigation.navigate('Results');
  };

  const handleEditSession = (session: ChallengeSession) => {
    loadSessionObject(session);

    if (session.status === 'created') {
      navigation.navigate('ShooterUpload');
      return;
    }

    if (session.status === 'shooter_submitted') {
      navigation.navigate('GoalkeeperResponse');
      return;
    }

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
              setDeletingRemoteId(session.remoteId);

              await deleteSessionFromSupabase(session.remoteId);

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

  const getStatusLabel = (status: SessionStatus) => {
    switch (status) {
      case 'created':
        return 'Created';
      case 'shooter_submitted':
        return 'Shooter Done';
      case 'goalkeeper_submitted':
        return 'Goalkeeper Done';
      case 'complete':
        return 'Complete';
      default:
        return status;
    }
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

          <View style={styles.controlCard}>
            <Text style={styles.controlTitle}>Filter by Status</Text>
            <View style={styles.filterRow}>
              {filterOptions.map((option) => {
                const isSelected = selectedFilter === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
                    onPress={() => setSelectedFilter(option.value)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        isSelected && styles.filterButtonTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.controlTitle}>Sort by Date</Text>
            <View style={styles.sortRow}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  selectedSort === 'newest' && styles.sortButtonSelected,
                ]}
                onPress={() => setSelectedSort('newest')}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    selectedSort === 'newest' && styles.sortButtonTextSelected,
                  ]}
                >
                  Newest First
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  selectedSort === 'oldest' && styles.sortButtonSelected,
                ]}
                onPress={() => setSelectedSort('oldest')}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    selectedSort === 'oldest' && styles.sortButtonTextSelected,
                  ]}
                >
                  Oldest First
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.resultCount}>
              Showing {visibleSessions.length} of {sessions.length} session(s)
            </Text>
          </View>

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
          ) : visibleSessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No sessions match the current filter.
              </Text>
            </View>
          ) : (
            visibleSessions.map((session) => {
              const isDeleting = deletingRemoteId === session.remoteId;
              const editLabel =
                session.status === 'created'
                  ? 'Continue Shooter Step'
                  : session.status === 'shooter_submitted'
                  ? 'Continue Goalkeeper Step'
                  : 'Open Final Results';

              return (
                <View
                  key={`${session.remoteId ?? session.challenge.id}`}
                  style={styles.sessionCard}
                >
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionTitle}>{session.challenge.challengeName}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {getStatusLabel(session.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sessionText}>Opponent: {session.challenge.opponent}</Text>
                  <Text style={styles.sessionText}>
                    Remote ID: {session.remoteId ?? 'Not synced'}
                  </Text>
                  <Text style={styles.sessionText}>
                    Created: {new Date(session.challenge.createdAt).toLocaleString()}
                  </Text>

                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={() => handleOpenSession(session)}
                  >
                    <Text style={styles.openButtonText}>Open in Results</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditSession(session)}
                  >
                    <Text style={styles.editButtonText}>{editLabel}</Text>
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
  controlCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  controlTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  filterButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  filterButtonSelected: {
    backgroundColor: '#111827',
  },
  filterButtonText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
  filterButtonTextSelected: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  sortButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sortButtonSelected: {
    backgroundColor: '#DBEAFE',
  },
  sortButtonText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
  sortButtonTextSelected: {
    color: '#1D4ED8',
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  sessionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  openButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  openButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  editButtonText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
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