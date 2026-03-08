import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen        from '../screens/HomeScreen';
import ChildScreen       from '../screens/dinth/ChildScreen';
import ResultScreen      from '../screens/dinth/ResultScreen';
import DrawingScreen     from '../screens/dinth/DrawingScreen';
import FinalResultScreen from '../screens/dinth/FinalResultScreen';

// import AdultScreen    from '../screens/member2/AdultScreen';
// import PregnantScreen from '../screens/member3/PregnantScreen';
// import ElderScreen    from '../screens/member4/ElderScreen';
import WelcomeScreen from "./screens/WelcomeScreen";
import IntroScreen from "./screens/IntroScreen";
import FaceScreen from "./screens/FaceScreen";
import QuestionnaireScreen from "./screens/QuestionnaireScreen";
import ResultScreen from "./screens/ResultScreen";
import ActivitiesScreen from "./screens/ActivitiesScreen";
import ActivityDetailScreen from "./screens/ActivityDetailScreen";
import Chatbot from "./screens/chatbot";
import DashboardScreen from "./screens/DashboardScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle     : { backgroundColor: '#1a1a2e' },
        headerTintColor : '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name='Home'             component={HomeScreen}        options={{ title: '🧠 Anxiety Detection'       }} />
      <Stack.Screen name='ChildScreen'      component={ChildScreen}       options={{ title: '👶 Step 1: Face Scan'        }} />
      <Stack.Screen name='ResultScreen'     component={ResultScreen}      options={{ title: '📊 Step 2: Scan Result'      }} />
      <Stack.Screen name='DrawingScreen'    component={DrawingScreen}     options={{ title: '🎨 Step 3: Draw a House'     }} />
      <Stack.Screen name='FinalResultScreen'component={FinalResultScreen} options={{ title: '📋 Full Assessment Report'  }} />
      {/* Other team members add screens here */}

        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Face" component={FaceScreen} />
        <Stack.Screen name="Questionnaire1" component={QuestionnaireScreen} />
        <Stack.Screen name="Result1" component={ResultScreen} />
        <Stack.Screen name="Activities1" component={ActivitiesScreen} />
        <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
        <Stack.Screen name="Chatbot" component={Chatbot} />
        <Stack.Screen name="Dashboard1" component={DashboardScreen} />

    </Stack.Navigator>
  );
}