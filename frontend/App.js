import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importación de pantallas y componentes personalizados
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import TeamsScreen from './screens/TeamsScreens/TeamsScreen';
import TeamMatchesScreen from './screens/TeamsScreens/TeamMatchesScreen';
import TeamDetailsScreen from './screens/TeamsScreens/TeamDetailsScreen';
import TeamPlayersScreen from './screens/TeamsScreens/TeamPlayersScreen';
import CreateTeamsScreen from './screens/TeamsScreens/CreateTeamsScreen';
import CreatePlayersScreen from './screens/TeamsScreens/CreatePlayersScreen';
import SettingsScreen from './screens/SettingsScreen';
import InfoScreen from './screens/InfoScreen';
import FloatingUserButton from './components/FloatingUserButton';
import StartMatchScreen from './screens/StartMatchScreens/StartMatchScreen';
import OpponentTeamScreen from './screens/StartMatchScreens/OpponentTeamScreen';
import StartingPlayersScreen from './screens/StartMatchScreens/StartingPlayersScreen';
import StatsScreen from './screens/StartMatchScreens/StatsScreen';
import StatsView from './screens/StartMatchScreens/StatsView';

// Creación de los navegadores
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Componente personalizado para el contenido del Drawer
function CustomDrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      {/* Encabezado del Drawer */}
      <View style={styles.header}>
        <View style={styles.orangeBall} />
        <Text style={styles.headerText}>CourtVision</Text>
      </View>
      {/* Lista de elementos del Drawer */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 60 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

// Stack Navigator para la sección "Teams" y sus subpantallas
function TeamsStack({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="TeamsList" 
        options={{ headerShown: false }}
        initialParams={{ user }}
      >
        {(props) => <TeamsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen 
        name="CreateTeam" 
        options={{ headerShown: false }}
      >
        {(props) => <CreateTeamsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen 
        name="CreatePlayer" 
        options={{ headerShown: false }}
      >
        {(props) => <CreatePlayersScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen 
        name="TeamPlayers" 
        options={{ headerShown: false }}
      >
        {(props) => <TeamPlayersScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen 
        name="TeamMatches" 
        options={{ headerShown: false }}
      >
        {(props) => <TeamMatchesScreen {...props} />}
      </Stack.Screen>
      
      <Stack.Screen 
        name="TeamDetails" 
        options={{ headerShown: false }}
      >
        {(props) => <TeamDetailsScreen {...props} />}
      </Stack.Screen>
      
      <Stack.Screen 
        name="StatsView" 
        options={{ headerShown: false }}
      >
        {(props) => <StatsView {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Stack Navigator para la pantalla "StartMatch" y sus subpantallas
function StartMatchStack({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="StartMatch" 
        options={{ headerShown: false }}
      >
        {(props) => <StartMatchScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen 
        name="OpponentTeam" 
        options={{ headerShown: false }} // Oculta el encabezado predeterminado
      >
        {(props) => <OpponentTeamScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen 
        name="StartingPlayers" 
        options={{ headerShown: false }} // Oculta el encabezado predeterminado
      >
        {(props) => <StartingPlayersScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen 
        name="StatsScreen" 
        options={{ headerShown: false }} // Oculta el encabezado predeterminado
      >
        {(props) => <StatsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen 
        name="StatsView" 
        options={{ headerShown: false }}
      >
        {(props) => <StatsView {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Configuración del Drawer Navigator
function DrawerNavigator({ user }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'permanent', // El Drawer siempre está visible
        headerShown: false, // Oculta el encabezado predeterminado
        drawerStyle: {
          backgroundColor: '#D9D9D9', // Color de fondo del Drawer
        },
        drawerActiveTintColor: 'black', // Color del texto de los elementos activos
        drawerActiveBackgroundColor: '#D9C6AE', // Color de fondo de los elementos activos
        drawerInactiveTintColor: 'black', // Color del texto de los elementos inactivos
        drawerItemStyle: { marginVertical: 10 }, // Espaciado entre elementos
        drawerLabelStyle: { fontSize: 15 }, // Tamaño de fuente de los elementos
      }}
    >
      {/* Definición de las pantallas principales del Drawer */}
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Teams">
        {(props) => <TeamsStack {...props} user={user} />}
      </Drawer.Screen>
      <Drawer.Screen name="Start a Match">
        {(props) => <StartMatchStack {...props} user={user} />}
      </Drawer.Screen>
      <Drawer.Screen name="Info" component={InfoScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// Componente principal de la aplicación
export default function App() {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario autenticado
  const [loading, setLoading] = useState(true); // Estado para manejar la carga inicial

  // Restaurar el usuario desde AsyncStorage al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error al cargar el usuario desde AsyncStorage:', error);
      } finally {
        setLoading(false); // Finaliza la carga inicial
      }
    };
    loadUser();
  }, []);

  // Guardar el usuario en AsyncStorage cuando cambie
  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error al guardar el usuario en AsyncStorage:', error);
      }
    };
    saveUser();
  }, [user]);

  if (loading) {
    // Mostrar un indicador de carga mientras se restaura el usuario
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Contenedor de navegación */}
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName={user ? "Main" : "Welcome"}>
          {/* Pantalla de bienvenida */}
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }}
          />
          {/* Pantalla de inicio de sesión */}
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
          {/* Pantalla de registro */}
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
          {/* Pantalla principal con el Drawer */}
          <Stack.Screen 
            name="Main" 
            options={{ headerShown: false }}
          >
            {(props) => <DrawerNavigator {...props} user={user} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      {/* Botón flotante para mostrar información del usuario */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
  },
});