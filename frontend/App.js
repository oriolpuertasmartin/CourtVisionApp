import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen'; 
import TeamsScreen from './screens/TeamsScreen'; 
import StartMatchScreen from './screens/StartMatchScreen'; 
import SettingsScreen from './screens/SettingsScreen'; 
import InfoScreen from './screens/InfoScreen'; 

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Toda la navegación lateral de tabs
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'permanent',
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Teams" component={TeamsScreen} />
      <Drawer.Screen name="Create Match" component={StartMatchScreen} />
      <Drawer.Screen name="Info" component={InfoScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// Navegación principal 
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Welcome">
        {/* Pantallas de autenticación */}
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ 
            headerBackTitleVisible: false, 
            headerTransparent: true, 
            title: '',
            headerTintColor: 'white', 
          }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ 
            headerBackTitleVisible: false, 
            headerTransparent: true, 
            title: '',
            headerTintColor: 'white', 
          }} 
        />
        {/* Pantalla principal de DrawerNavigator */}
        <Stack.Screen 
          name="Main" 
          component={DrawerNavigator} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}