import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { ChallengeProvider } from './context/ChallengeContext';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import CreateChallengeScreen from './screens/CreateChallengeScreen';
import ShooterUploadScreen from './screens/ShooterUploadScreen';
import GoalkeeperResponseScreen from './screens/GoalkeeperResponseScreen';
import ResultsScreen from './screens/ResultsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  CreateChallenge: undefined;
  ShooterUpload: undefined;
  GoalkeeperResponse: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setIsBooting(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isBooting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={session ? 'Home' : 'Auth'}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} />
            <Stack.Screen name="ShooterUpload" component={ShooterUploadScreen} />
            <Stack.Screen name="GoalkeeperResponse" component={GoalkeeperResponseScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ChallengeProvider>
      <AppNavigator />
    </ChallengeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});