// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screen/HomeScreen';
import QuestionnaireScreen from './screen/QuestionnaireScreen';
import CameraScreen from './screen/CameraScreen';
import RelaxScreen from './screen/RelaxScreen';
import EldersScreen from './screen/EldersScreen';
import ElderViewScreen from './screen/ElderViewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
          <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} options={{ title: 'Questionnaire' }} />
          <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Camera' }} />
          <Stack.Screen name="Relax" component={RelaxScreen} options={{ title: 'Relax' }} />
          <Stack.Screen name="Elders" component={EldersScreen} options={{ title: 'Elders Questionnaire' }} />
          <Stack.Screen name="ElderView" component={ElderViewScreen} options={{ title: 'Elders' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}



