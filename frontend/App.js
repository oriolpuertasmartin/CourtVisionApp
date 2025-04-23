import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Ionicons } from "@expo/vector-icons"; 

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
import SettingsScreen from './screens/SettingsScreens/SettingsScreen'; 
import InfoScreen from './screens/InfoScreen';
import FloatingUserButton from './components/FloatingUserButton';
import StartMatchScreen from './screens/StartMatchScreens/StartMatchScreen';
import OpponentTeamScreen from './screens/StartMatchScreens/OpponentTeamScreen';
import StartingPlayersScreen from './screens/StartMatchScreens/StartingPlayersScreen';
import StatsScreen from './screens/StartMatchScreens/StatsScreen';
import StatsView from './screens/StartMatchScreens/StatsViewScreen';
import ProfileScreen from './screens/SettingsScreens/ProfileScreen';
import ChangePasswordScreen from './screens/SettingsScreens/ChangePasswordScreen';

// Creación del cliente de Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

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

// Stack Navigator para la sección "Settings" y sus subpantallas
function SettingsStack({ handleLogout, setUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="SettingsList" 
        options={{ headerShown: false }}
      >
        {(props) => <SettingsScreen {...props} handleLogout={handleLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Profile" 
        options={{ headerShown: false }}
      >
        {(props) => <ProfileScreen {...props} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen 
        name="ChangePassword" 
        options={{ headerShown: false }}
        component={ChangePasswordScreen}
      />
    </Stack.Navigator>
  );
}

// Configuración del Drawer Navigator
function DrawerNavigator({ user, handleLogout, setUser }) {
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
        drawerItemStyle: { 
          marginVertical: 20, // Aumentado de 10 a 20 para mayor separación
          borderRadius: 8, // Añadido para dar bordes redondeados a los elementos
          paddingVertical: 5, // Añadido para dar más altura a cada elemento
        },
        drawerLabelStyle: { 
          fontSize: 15, // Tamaño de fuente de los elementos
          fontWeight: '500', // Añadido para hacer el texto un poco más visible
        },
        drawerContentContainerStyle: {
          paddingTop: 10, // Espacio adicional en la parte superior de la lista
          paddingBottom: 30, // Espacio adicional en la parte inferior de la lista
        }
      }}
    >
      {/* Definición de las pantallas principales del Drawer */}
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={color} 
            />
          )
        }}
      />
      
      <Drawer.Screen 
        name="Teams" 
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={color} 
            />
          )
        }}
      >
        {(props) => <TeamsStack {...props} user={user} />}
      </Drawer.Screen>
      
      <Drawer.Screen 
        name="Start a Match" 
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "basketball" : "basketball-outline"} 
              size={24} 
              color={color} 
            />
          )
        }}
      >
        {(props) => <StartMatchStack {...props} user={user} />}
      </Drawer.Screen>
      
      <Drawer.Screen 
        name="Info" 
        component={InfoScreen} 
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "information-circle" : "information-circle-outline"} 
              size={24} 
              color={color} 
            />
          )
        }}
      />
      
      <Drawer.Screen 
        name="Settings" 
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={24} 
              color={color} 
            />
          )
        }}
      >
        {(props) => <SettingsStack {...props} handleLogout={handleLogout} setUser={setUser} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

// Componente principal de la aplicación
export default function App() {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario autenticado
  const [loading, setLoading] = useState(true); // Estado para manejar la carga inicial
  const [navigationReady, setNavigationReady] = useState(false);
  const navigationRef = useRef(null);

  // Función centralizada para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      console.log('Cerrando sesión...');
      
      // Primero limpiar el almacenamiento y la caché
      await AsyncStorage.removeItem('user');
      queryClient.clear();
      
      // Luego actualizar el estado
      setUser(null);
      
      // Finalmente, navegar a la pantalla de bienvenida
      if (navigationRef.current) {
        console.log('Navegando a Welcome...');
        if (Platform.OS === 'web') {
          // En web, a veces reset no funciona bien, usar navigate
          navigationRef.current.navigate('Welcome');
        } else {
          // En móvil, usar reset que es más seguro
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }
      } else {
        console.error('navigationRef no está disponible');
        // Fallback para web
        if (Platform.OS === 'web' && window) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Intento alternativo para web
      if (Platform.OS === 'web' && window) {
        window.location.href = '/';
      }
    }
  };

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
        }
      } catch (error) {
        console.error('Error al guardar el usuario en AsyncStorage:', error);
      }
    };
    
    if (user !== null) {
      saveUser();
    }
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
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }}>
        {/* Contenedor de navegación */}
        <NavigationContainer 
          ref={navigationRef}
          onReady={() => setNavigationReady(true)}
        >
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
              {(props) => <DrawerNavigator {...props} user={user} handleLogout={handleLogout} setUser={setUser} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        {/* Botón flotante para mostrar información del usuario */}
        {user && (
          <FloatingUserButton 
            user={user}
            onPress={() => navigationRef.current?.navigate('Settings', { screen: 'Profile' })}
            onLogout={handleLogout}
          />
        )}
      </View>
      {Platform.OS === 'web' && __DEV__ && <ReactQueryDevtools />}
    </QueryClientProvider>
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