import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import CreateChallengeScreen from './screens/CreateChallengeScreen';
import ShooterUploadScreen from './screens/ShooterUploadScreen';
import GoalkeeperResponseScreen from './screens/GoalkeeperResponseScreen';
import ResultsScreen from './screens/ResultsScreen';
import type { Challenge } from './types/challenge';

export type RootStackParamList = {
  Home: undefined;
  CreateChallenge: undefined;
  ShooterUpload: {
    challenge: Challenge;
  };
  GoalkeeperResponse: {
    challenge: Challenge;
  };
  Results: {
    challenge: Challenge;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="CreateChallenge"
          component={CreateChallengeScreen}
          options={{ title: 'Create Challenge' }}
        />
        <Stack.Screen
          name="ShooterUpload"
          component={ShooterUploadScreen}
          options={{ title: 'Shooter Upload' }}
        />
        <Stack.Screen
          name="GoalkeeperResponse"
          component={GoalkeeperResponseScreen}
          options={{ title: 'Goalkeeper Response' }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Results' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}