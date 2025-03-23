import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import TeamsScreen from './screens/TeamsScreen';
import StartMatchScreen from './screens/StartMatchScreen';
import SettingsScreen from './screens/SettingsScreen';
import InfoScreen from './screens/InfoScreen';
import FloatingUserButton from './components/FloatingUserButton';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.orangeBall} />
        <Text style={styles.headerText}>CourtVision</Text>
      </View>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 60 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

function DrawerNavigator({ user }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'permanent',
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#D9D9D9',
        },
        drawerActiveTintColor: 'black',
        drawerActiveBackgroundColor: '#D9C6AE',
        drawerInactiveTintColor: 'black',
        drawerItemStyle: { marginVertical: 10 },
        drawerLabelStyle: { fontSize: 15 }, 
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Teams" component={TeamsScreen} />
      <Drawer.Screen name="Start a Match">
        {(props) => <StartMatchScreen {...props} user={user} />}
      </Drawer.Screen>
      <Drawer.Screen name="Info" component={InfoScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  console.log("Estado del usuario en App.js:", user);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login"
            options={{
              headerBackTitleVisible: false,
              headerTransparent: true,
              title: '',
              headerTintColor: 'white',
            }}
          >
            {(props) => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
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
          <Stack.Screen 
            name="Main" 
            options={{ headerShown: false }}
          >
            {(props) => <DrawerNavigator {...props} user={user} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      {user && (
        <FloatingUserButton 
          user={user}
          onPress={() => console.log('Floating button pressed')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#D9D9D9',
  },
  orangeBall: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: 'orange',
    marginRight: 15,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
});