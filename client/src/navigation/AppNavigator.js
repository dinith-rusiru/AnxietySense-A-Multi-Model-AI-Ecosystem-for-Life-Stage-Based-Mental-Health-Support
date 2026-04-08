import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 
import HomeScreen1        from '../screens/HomeScreen';
  
import HomeScreen        from '../screens/dinth/HomeScreen';
import ChildScreen       from '../screens/dinth/ChildScreen';
import ResultScreen      from '../screens/dinth/ResultScreen';
import DrawingScreen     from '../screens/dinth/DrawingScreen';
import DrawingResultScreen from '../screens/dinth/DrawingResultScreen';
import FinalResultScreen from '../screens/dinth/FinalResultScreen';
import ActivityScreen    from '../screens/dinth/ActivityScreen';
import WeeklyScreen      from '../screens/dinth/WeeklyScreen';
// import AdultScreen    from '../screens/member2/AdultScreen';
// import PregnantScreen from '../screens/member3/PregnantScreen';
// import ElderScreen    from '../screens/member4/ElderScreen';

import Welcome from "../screens/chathumi/WelcomeScreen";
import VoiceScreen from "../screens/chathumi/VoiceScreen";   // NEW
import InstructionScreen from "../screens/chathumi/InstructionScreen";
import QuestionnaireScreen from "../screens/chathumi/QuestionnaireScreen";
import ResultScreen2 from "../screens/chathumi/ResultScreen";
import ActivitiesScreen from "../screens/chathumi/ActivitiesScreen";
import ActivityDetailScreen from "../screens/chathumi/ActivityDetailScreen";
import DashboardScreen from "../screens/chathumi/DashboardScreen";

import WelcomeScreen from "../screens/nadun/WelcomeScreen";
import IntroScreen from "../screens/nadun/IntroScreen";
import FaceScreen from "../screens/nadun/FaceScreen";
import QuestionnaireScreen1 from "../screens/nadun/QuestionnaireScreen";
import ResultScreen1 from "../screens/nadun/ResultScreen";
import ActivitiesScreen1 from "../screens/nadun/ActivitiesScreen";
import ActivityDetailScreen1 from "../screens/nadun/ActivityDetailScreen";
import Chatbot from "../screens/nadun/chatbot";
import DashboardScreen1 from "../screens/nadun/DashboardScreen";

import HomeScreen111                  from '../screens/dulari/HomeScreen111';
import QuestionnaireScreennn         from '../screens/dulari/QuestionnaireScreen';
import CameraScreen                from '../screens/dulari/CameraScreen';
import RelaxScreen                 from '../screens/dulari/RelaxScreen';
import EldersScreen                from '../screens/dulari/EldersScreen';
import ElderViewScreen             from '../screens/dulari/ElderViewScreen';
import RecommendedActivitiesScreen from '../screens/dulari/RecommendedActivitiesScreen';
import ActivityPlayerScreen        from '../screens/dulari/ActivityPlayerScreen';
import ActivityHistoryScreen       from '../screens/dulari/ActivityHistoryScreen';

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
      <Stack.Screen name='Home1'             component={HomeScreen1}        options={{ title: '🧠 Anxiety Detection'       }} />

      <Stack.Screen name='Home'             component={HomeScreen}        />
      <Stack.Screen name='ChildScreen'      component={ChildScreen}       />
      <Stack.Screen name='ResultScreen'     component={ResultScreen}      />

      <Stack.Screen name='DrawingScreen'    component={DrawingScreen}     />
      <Stack.Screen name='DrawingResultScreen'component={DrawingResultScreen} />

      <Stack.Screen name='FinalResultScreen'component={FinalResultScreen} />
      <Stack.Screen name='ActivityScreen'   component={ActivityScreen}    />
      <Stack.Screen name='WeeklyScreen'     component={WeeklyScreen}      />
      {/* Other team members add screens here */}

        <Stack.Screen name="WelcomeScreen" component={Welcome} />
        <Stack.Screen name="Voice" component={VoiceScreen} />
        <Stack.Screen name="Instructions" component={InstructionScreen} />
        <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
        <Stack.Screen name="Result" component={ResultScreen2} />
        <Stack.Screen name="Activities" component={ActivitiesScreen} />
        <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "My Progress" }} />

        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Face" component={FaceScreen} />
        <Stack.Screen name="Questionnaire1" component={QuestionnaireScreen1} />
        <Stack.Screen name="Result1" component={ResultScreen1} />
        <Stack.Screen name="Activities1" component={ActivitiesScreen1} />
        <Stack.Screen name="ActivityDetail1" component={ActivityDetailScreen1} />
        <Stack.Screen name="Chatbot" component={Chatbot} />
        <Stack.Screen name="Dashboard1" component={DashboardScreen1} />

          <Stack.Screen name="Home111"                  component={HomeScreen111}                  options={{ title: 'Home' }} />
          <Stack.Screen name="Questionnaireee"         component={QuestionnaireScreennn}         options={{ title: 'Questionnaire' }} />
          <Stack.Screen name="Camera"                component={CameraScreen}                options={{ title: 'Camera' }} />
          <Stack.Screen name="Relax"                 component={RelaxScreen}                 options={{ title: 'Relax' }} />
          <Stack.Screen name="Elders"                component={EldersScreen}                options={{ title: 'Elders Questionnaire' }} />
          <Stack.Screen name="ElderView"             component={ElderViewScreen}             options={{ title: 'Elders' }} />
          <Stack.Screen name="RecommendedActivities" component={RecommendedActivitiesScreen} options={{ title: 'Activities' }} />
          <Stack.Screen name="ActivityPlayer"        component={ActivityPlayerScreen}        options={{ title: 'Activity' }} />
          <Stack.Screen name="ActivityHistory"       component={ActivityHistoryScreen}       options={{ title: 'History' }} />
    </Stack.Navigator>
  );
}