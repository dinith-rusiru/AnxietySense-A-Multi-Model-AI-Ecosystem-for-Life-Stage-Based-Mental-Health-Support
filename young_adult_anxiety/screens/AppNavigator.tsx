import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './OnboardingScreen';
import HomeScreen from './HomeScreen';
import AssessmentScreen from './AssessmentScreen';
import ResultsScreen from './ResultsScreen';
import ProfileScreen from './ProfileScreen';
import HistoryScreen from './HistoryScreen';
import InterventionsScreen from './InterventionsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false, // Hides the header for a cleaner look
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        {/* The main app screens are in a separate group to handle navigation logic, like preventing going back to onboarding */}
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Assessment" component={AssessmentScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Interventions" component={InterventionsScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
