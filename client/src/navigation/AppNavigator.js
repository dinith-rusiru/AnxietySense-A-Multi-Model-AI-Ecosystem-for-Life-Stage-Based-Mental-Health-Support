// import { createStackNavigator } from '@react-navigation/stack';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
// ── Import your screens ───────────────────────────────────────
import ChildScreen  from '../screens/dinth/ChildScreen';
import ResultScreen from '../screens/dinth/ResultScreen';
import HomeScreen from '../screens/HomeScreen';

// ── Other team members import their screens here ──────────────
// import AdultScreen    from '../screens/member2/AdultScreen';
// import PregnantScreen from '../screens/member3/PregnantScreen';
// import ElderScreen    from '../screens/member4/ElderScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle    : { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name='Home'
        component={HomeScreen}
        options={{ title: '🧠 Anxiety Detection' }}
      />

      {/* ── Dinth screens ───────────────────────────────────── */}
      <Stack.Screen
        name='ChildScreen'
        component={ChildScreen}
        options={{ title: '👶 Child Anxiety Detection' }}
      />
      <Stack.Screen
        name='ResultScreen'
        component={ResultScreen}
        options={{ title: '📊 Analysis Result' }}
      />

      {/* ── Other team members add their screens below ──────── */}
    </Stack.Navigator>
  );
}