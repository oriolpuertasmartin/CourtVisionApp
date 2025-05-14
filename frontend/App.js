import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Ionicons } from "@expo/vector-icons";

import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import TeamsScreen from "./screens/TeamsScreens/TeamsScreen";
import TeamMatchesScreen from "./screens/TeamsScreens/TeamMatchesScreen";
import TeamDetailsScreen from "./screens/TeamsScreens/TeamDetailsScreen";
import TeamPlayersScreen from "./screens/TeamsScreens/TeamPlayersScreen";
import CreateTeamsScreen from "./screens/TeamsScreens/CreateTeamsScreen";
import CreatePlayersScreen from "./screens/TeamsScreens/CreatePlayersScreen";
import SettingsScreen from "./screens/SettingsScreens/SettingsScreen";
import InfoScreen from "./screens/InfoScreen";
import FloatingUserButton from "./components/FloatingUserButton";
import StartMatchScreen from "./screens/StartMatchScreens/StartMatchScreen";
import OpponentTeamScreen from "./screens/StartMatchScreens/OpponentTeamScreen";
import StartingPlayersScreen from "./screens/StartMatchScreens/StartingPlayersScreen";
import StatsScreen from "./screens/StartMatchScreens/StatsScreen";
import StatsView from "./screens/StartMatchScreens/StatsViewScreen";
import ProfileScreen from "./screens/SettingsScreens/ProfileScreen";
import ChangePasswordScreen from "./screens/SettingsScreens/ChangePasswordScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.headerText}>CourtVision</Text>
        <TouchableOpacity
          style={styles.closeDrawerButton}
          onPress={() => props.onClose ? props.onClose() : props.navigation.closeDrawer()}
        >
          <Ionicons name="close-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 60 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

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
      <Stack.Screen name="CreateTeam" options={{ headerShown: false }}>
        {(props) => <CreateTeamsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="CreatePlayer" options={{ headerShown: false }}>
        {(props) => <CreatePlayersScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="TeamPlayers" options={{ headerShown: false }}>
        {(props) => <TeamPlayersScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="TeamMatches" options={{ headerShown: false }}>
        {(props) => <TeamMatchesScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="TeamDetails" options={{ headerShown: false }}>
        {(props) => <TeamDetailsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="StatsView" options={{ headerShown: false }}>
        {(props) => <StatsView {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function StartMatchStack({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StartMatch" options={{ headerShown: false }}>
        {(props) => <StartMatchScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="OpponentTeam"
        options={{ headerShown: false }}
      >
        {(props) => <OpponentTeamScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="StartingPlayers"
        options={{ headerShown: false }}
      >
        {(props) => <StartingPlayersScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="StatsScreen"
        options={{ headerShown: false }}
      >
        {(props) => <StatsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="StatsView" options={{ headerShown: false }}>
        {(props) => <StatsView {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function SettingsStack({ handleLogout, setUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsList" options={{ headerShown: false }}>
        {(props) => <SettingsScreen {...props} handleLogout={handleLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Profile" options={{ headerShown: false }}>
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

function DrawerNavigator({ user, handleLogout, setUser, navigation, route }) {
  const [isDrawerVisible, setIsDrawerVisible] = useState(true);
  const [activeScreen, setActiveScreen] = useState("Home");
  const drawerNavigationRef = useRef(null);
  const initialScreenRef = useRef("Home");
  
  // Esta función se actualiza para manejar el cambio de pantalla activa
  const handleScreenChange = (screenName) => {
    if (screenName) {
      setActiveScreen(screenName);
      // Almacenar la pantalla activa para recordarla cuando se vuelva a abrir el drawer
      initialScreenRef.current = screenName;
    }
  };
  
  // Inicializar el drawer visible al principio
  useEffect(() => {
    setIsDrawerVisible(true);
  }, []);

  const renderScreenContent = () => {
    // Determina qué pantalla mostrar basándose en la pantalla activa actual
    const currentScreen = initialScreenRef.current || activeScreen;
    
    switch(currentScreen) {
      case "Home":
        return <HomeScreen />;
      case "Teams":
        return <TeamsStack user={user} />;
      case "Start a Match":
        return <StartMatchStack user={user} />;
      case "Info":
        return <InfoScreen />;
      case "Settings":
        return <SettingsStack handleLogout={handleLogout} setUser={setUser} />;
      default:
        return <HomeScreen />;
    }
  };
  
  const toggleDrawer = () => {
    if (!isDrawerVisible) {
      // Cuando volvemos a mostrar el drawer
      setIsDrawerVisible(true);
      
      // Importante: Al volver a mostrar el drawer, necesitamos navegar explícitamente a la pantalla almacenada
      if (drawerNavigationRef.current) {
        // Usamos setTimeout para asegurarnos de que el drawer esté completamente montado
        setTimeout(() => {
          if (drawerNavigationRef.current) {
            drawerNavigationRef.current.navigate(initialScreenRef.current);
          }
        }, 100);
      }
    } else {
      // Cuando cerramos el drawer
      setIsDrawerVisible(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {isDrawerVisible ? (
        <View style={{ flex: 1 }}>
          <Drawer.Navigator
            ref={drawerNavigationRef}
            drawerContent={(props) => (
              <CustomDrawerContent 
                {...props}
                onClose={() => toggleDrawer()}
              />
            )}
            screenOptions={{
              drawerType: "permanent",
              headerShown: false,
              drawerStyle: {
                backgroundColor: "#D9D9D9",
                width: 360,
              },
              drawerActiveTintColor: "black",
              drawerActiveBackgroundColor: "#D9C6AE",
              drawerInactiveTintColor: "black",
              drawerItemStyle: {
                marginVertical: 30,
                borderRadius: 8,
                paddingVertical: 5,
              },
              drawerLabelStyle: {
                fontSize: Platform.OS === 'web' ? 18 : 14,
                fontWeight: Platform.OS === 'web' ? "500" : "300",
                marginLeft: 10, 
              },
              drawerContentContainerStyle: {
                paddingTop: 10,
                paddingBottom: 30,
              },
            }}
            defaultStatus="open"
            initialRouteName={initialScreenRef.current}
            screenListeners={{
              state: (e) => {
                if (e.data && e.data.state && e.data.state.index >= 0) {
                  const currentRouteName = e.data.state.routes[e.data.state.index].name;
                  handleScreenChange(currentRouteName);
                }
              }
            }}
          >
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={{
                drawerIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={27}
                    color={color}
                  />
                ),
              }}
            />
            
            <Drawer.Screen
              name="Teams"
              options={{
                drawerIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "people" : "people-outline"}
                    size={27}
                    color={color}
                  />
                ),
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
                    size={27}
                    color={color}
                  />
                ),
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
                    name={
                      focused ? "information-circle" : "information-circle-outline"
                    }
                    size={27}
                    color={color}
                  />
                ),
              }}
            />
            
            <Drawer.Screen
              name="Settings"
              options={{
                drawerIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "settings" : "settings-outline"}
                    size={27}
                    color={color}
                  />
                ),
              }}
            >
              {(props) => (
                <SettingsStack
                  {...props}
                  handleLogout={handleLogout}
                  setUser={setUser}
                />
              )}
            </Drawer.Screen>
          </Drawer.Navigator>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {renderScreenContent()}
          
          {/* Botón para mostrar el drawer - ahora mantiene la pantalla actual */}
          <TouchableOpacity 
            style={styles.showMenuButton}
            onPress={toggleDrawer}
          >
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigationReady, setNavigationReady] = useState(false);
  const navigationRef = useRef(null);

  const handleLogout = async () => {
    try {
      console.log("Cerrando sesión...");
      await AsyncStorage.removeItem("user");
      queryClient.clear();
      setUser(null);

      if (navigationRef.current) {
        if (Platform.OS === "web") {
          navigationRef.current.navigate("Welcome");
        } else {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          });
        }
      } else {
        if (Platform.OS === "web" && window) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      if (Platform.OS === "web" && window) {
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
      }
    };

    if (user !== null) {
      saveUser();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => setNavigationReady(true)}
        >
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName={user ? "Main" : "Welcome"}>
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
                title: "",
                headerTintColor: "white",
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
                title: "",
                headerTintColor: "white",
              }}
            />
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {(props) => (
                <DrawerNavigator
                  {...props}
                  user={user}
                  handleLogout={handleLogout}
                  setUser={setUser}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        {user && (
          <FloatingUserButton
            user={user}
            onPress={() =>
              navigationRef.current?.navigate("Settings", { screen: "Profile" })
            }
            onLogout={handleLogout}
          />
        )}
      </View>
      {Platform.OS === "web" && __DEV__ && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#D9D9D9",
    position: 'relative', 
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 15,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginLeft: 10,
    flex: 1, 
  },
  closeDrawerButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -14 }],
    padding: 8,
  },
  showMenuButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
});