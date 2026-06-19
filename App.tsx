import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ChallengeProvider, useChallenge } from './context/ChallengeContext';
import HomeScreen from './screens/HomeScreen';
import CreateChallengeScreen from './screens/CreateChallengeScreen';
import ShooterUploadScreen from './screens/ShooterUploadScreen';
import GoalkeeperResponseScreen from './screens/GoalkeeperResponseScreen';
import ResultsScreen from './screens/ResultsScreen';

export type RootStackParamList = {
  Home: undefined;
  CreateChallenge: undefined;
  ShooterUpload: undefined;
  GoalkeeperResponse: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isHydrated } = useChallenge();

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} />
        <Stack.Screen name="ShooterUpload" component={ShooterUploadScreen} />
        <Stack.Screen name="GoalkeeperResponse" component={GoalkeeperResponseScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
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