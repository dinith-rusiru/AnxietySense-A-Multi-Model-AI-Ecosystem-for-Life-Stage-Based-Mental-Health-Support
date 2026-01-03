import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./screens/WelcomeScreen";
import VoiceScreen from "./screens/VoiceScreen";   // NEW
import InstructionScreen from "./screens/InstructionScreen";
import QuestionnaireScreen from "./screens/QuestionnaireScreen";
import ResultScreen from "./screens/ResultScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Voice" component={VoiceScreen} />
        <Stack.Screen name="Instructions" component={InstructionScreen} />
        <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
