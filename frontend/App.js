import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
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
import authService from "./services/authService";

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

// Función para determinar el tipo de dispositivo con ajustes más precisos
function getDeviceType() {
  const { width, height } = Dimensions.get("window");
  // En modo landscape, width será el lado más largo
  const screenSize = Math.min(width, height); // Usamos el lado más corto para determinar el tipo

  if (screenSize < 400) return "small-phone"; // Para iPhone SE, pequeños Android
  if (screenSize < 480) return "phone"; // Para la mayoría de teléfonos (iPhone 12, etc)
  if (screenSize < 768) return "large-phone"; // Para teléfonos grandes
  if (screenSize < 1024) return "tablet"; // Para tablets
  return "desktop"; // Para web o grandes tabletas
}

// Función para detectar si es un iPhone con notch o Dynamic Island
function hasNotch() {
  // Simplificado para detectar iPhones modernos con notch o dynamic island
  const { height, width } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((height >= 812 && width >= 375) || (width >= 812 && height >= 375))
  );
}

function CustomDrawerContent(props) {
  const deviceType = getDeviceType();
  const isSmallPhone = deviceType === "small-phone";
  const isPhone = deviceType === "phone" || deviceType === "small-phone";
  const isTablet = deviceType === "tablet" || deviceType === "large-phone";
  const isDesktop = deviceType === "desktop";
  
  // Detectar si es un iPhone con notch
  const deviceHasNotch = hasNotch();
  
  // Ajustar padding adicional para dispositivos con notch
  const notchPadding = deviceHasNotch ? 20 : 0;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[
          styles.header,
          isDesktop && styles.headerDesktop,
          isTablet && styles.headerTablet,
          isPhone && styles.headerPhone,
          isSmallPhone && styles.headerSmallPhone,
          // Añadir padding adicional para notch
          deviceHasNotch && { paddingTop: isPhone ? 35 + notchPadding : 25 + notchPadding }
        ]}
      >
        <Image
          source={require("./assets/logo.png")}
          style={[
            styles.logo,
            isDesktop && styles.logoDesktop,
            isTablet && styles.logoTablet,
            isPhone && styles.logoPhone,
            isSmallPhone && styles.logoSmallPhone,
          ]}
        />
        <Text
          style={[
            styles.headerText,
            isDesktop && styles.headerTextDesktop,
            isTablet && styles.headerTextTablet,
            isPhone && styles.headerTextPhone,
            isSmallPhone && styles.headerTextSmallPhone,
          ]}
        >
          CourtVision
        </Text>
        <TouchableOpacity
          style={[
            styles.closeDrawerButton,
            isDesktop && styles.closeDrawerButtonDesktop,
            isPhone && styles.closeDrawerButtonPhone,
            deviceHasNotch && { top: "40%" }
          ]}
          onPress={() =>
            props.onClose ? props.onClose() : props.navigation.closeDrawer()
          }
        >
          <Ionicons
            name="close-outline"
            size={isDesktop ? 40 : isTablet ? 35 : isPhone ? 28 : 24}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          { paddingTop: 60 },
          isDesktop && { paddingTop: 80 },
          isPhone && { paddingTop: 40 },
          isSmallPhone && { paddingTop: 20 },
        ]}
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
      <Stack.Screen name="OpponentTeam" options={{ headerShown: false }}>
        {(props) => <OpponentTeamScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="StartingPlayers" options={{ headerShown: false }}>
        {(props) => <StartingPlayersScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="StatsScreen" options={{ headerShown: false }}>
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
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const deviceType = getDeviceType();
  const deviceHasNotch = hasNotch();

  // Función para verificar orientación actual
  const isLandscape = () => {
    const { width, height } = Dimensions.get('window');
    return width > height;
  };

  // Actualizar las dimensiones de la pantalla cuando cambien
  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions(Dimensions.get("window"));
    };

    const dimensionsListener = Dimensions.addEventListener(
      "change",
      updateDimensions
    );

    return () => dimensionsListener.remove();
  }, []);

  // Detectar si estamos en orientación portrait y mostrar alerta para modo apaisado
  useEffect(() => {
    if (Platform.OS !== 'web' && !isLandscape()) {
      const showOrientationAlert = async () => {
        // Verificar si ya se ha mostrado la alerta
        const hasShownAlert = await AsyncStorage.getItem('orientationAlertShown');
        if (!hasShownAlert) {
          Alert.alert(
            "Recomendación",
            "Para una mejor experiencia, por favor gira tu dispositivo a modo horizontal.",
            [
              { 
                text: "OK",
                onPress: () => AsyncStorage.setItem('orientationAlertShown', 'true')
              }
            ]
          );
        }
      };
      
      showOrientationAlert();
    }
  }, []);

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

  // Configurar ancho del drawer basado en tipo de dispositivo
  const getDrawerWidth = () => {
    if (deviceType === "desktop") return 400; // Más ancho para desktop
    if (deviceType === "tablet") return 350; // Medio para tablet
    if (deviceType === "large-phone") return 300; // Ajuste para teléfonos grandes
    if (deviceType === "phone") return 260; // Para teléfonos normales
    return 220; // Para teléfonos pequeños
  };

  // Configurar el espacio vertical entre elementos basado en tipo de dispositivo
  const getDrawerItemVerticalMargin = () => {
    if (deviceType === "desktop") return 40; // Más espacio en desktop
    if (deviceType === "tablet") return 35; // Medio para tablet
    if (deviceType === "large-phone") return 25; // Menos en teléfonos grandes
    if (deviceType === "phone") return 20; // Aún menos en teléfonos
    return 12; // Mínimo para teléfonos pequeños
  };

  // Configurar el tamaño de fuente basado en tipo de dispositivo
  const getDrawerLabelFontSize = () => {
    if (deviceType === "desktop") return 20;
    if (deviceType === "tablet") return 18;
    if (deviceType === "large-phone") return 16;
    if (deviceType === "phone") return 14;
    return 12; // Para teléfonos pequeños
  };

  // Tamaño de los iconos basado en tipo de dispositivo
  const getIconSize = () => {
    if (deviceType === "desktop") return 32;
    if (deviceType === "tablet") return 28;
    if (deviceType === "large-phone") return 26;
    if (deviceType === "phone") return 22;
    return 20; // Para teléfonos pequeños
  };

  // Ajuste del padding vertical para elementos del drawer
  const getItemPaddingVertical = () => {
    if (deviceType === "desktop") return 10;
    if (deviceType === "tablet") return 8;
    if (deviceType === "large-phone") return 6;
    return 4; // Para teléfonos y teléfonos pequeños
  };

  const renderScreenContent = () => {
    // Determina qué pantalla mostrar basándose en la pantalla activa actual
    const currentScreen = initialScreenRef.current || activeScreen;

    switch (currentScreen) {
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
              <CustomDrawerContent {...props} onClose={() => toggleDrawer()} />
            )}
            screenOptions={{
              drawerType: "permanent",
              headerShown: false,
              drawerStyle: {
                backgroundColor: "#D9D9D9",
                width: getDrawerWidth(),
              },
              drawerActiveTintColor: "black",
              drawerActiveBackgroundColor: "#D9C6AE",
              drawerInactiveTintColor: "black",
              drawerItemStyle: {
                marginVertical: getDrawerItemVerticalMargin(),
                borderRadius: 8,
                paddingVertical: getItemPaddingVertical(),
              },
              drawerLabelStyle: {
                fontSize: getDrawerLabelFontSize(),
                fontWeight:
                  deviceType === "desktop" || deviceType === "tablet"
                    ? "500"
                    : "300",
                marginLeft:
                  deviceType === "desktop"
                    ? 15
                    : deviceType === "tablet"
                    ? 10
                    : 5,
              },
              drawerContentContainerStyle: {
                paddingTop:
                  deviceType === "desktop"
                    ? 20
                    : deviceType === "tablet"
                    ? 15
                    : 10,
                paddingBottom:
                  deviceType === "desktop"
                    ? 40
                    : deviceType === "tablet"
                    ? 30
                    : 20,
              },
            }}
            defaultStatus="open"
            initialRouteName={initialScreenRef.current}
            screenListeners={{
              state: (e) => {
                if (e.data && e.data.state && e.data.state.index >= 0) {
                  const currentRouteName =
                    e.data.state.routes[e.data.state.index].name;
                  handleScreenChange(currentRouteName);
                }
              },
            }}
          >
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={{
                drawerIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={getIconSize()}
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
                    size={getIconSize()}
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
                    size={getIconSize()}
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
                      focused
                        ? "information-circle"
                        : "information-circle-outline"
                    }
                    size={getIconSize()}
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
                    size={getIconSize()}
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
            style={[
              styles.showMenuButton,
              deviceType === "desktop" && styles.showMenuButtonDesktop,
              deviceType === "tablet" && styles.showMenuButtonTablet,
              deviceType === "phone" && styles.showMenuButtonPhone,
              deviceType === "small-phone" && styles.showMenuButtonSmallPhone,
              // Ajustar posición para dispositivos con notch
              deviceHasNotch && { top: deviceType === "phone" ? 55 : 50 }
            ]}
            onPress={toggleDrawer}
          >
            <Ionicons
              name="menu"
              size={
                deviceType === "desktop"
                  ? 36
                  : deviceType === "tablet"
                  ? 32
                  : deviceType === "large-phone"
                  ? 28
                  : deviceType === "phone"
                  ? 24
                  : 20
              }
              color="black"
            />
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
      // Usar el servicio de autenticación para el cierre de sesión
      await authService.logout();
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
        // Usar el servicio de autenticación para cargar el usuario
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
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
      // No es necesario guardar el usuario aquí ya que el servicio de autenticación
      // se encarga de guardarlo al iniciar sesión.
      // Esta lógica se mantiene por si se actualiza el usuario desde otro lugar.
      try {
        if (user) {
          await authService.saveUserToStorage(user);
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
      {/* Comento esta línea temporalmente porque me da errores */}
      {/* {Platform.OS === "web" && __DEV__ && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#D9D9D9",
    position: "relative",
  },
  headerDesktop: {
    padding: 30,
  },
  headerTablet: {
    padding: 25,
  },
  headerPhone: {
    padding: 15,
    paddingTop: 30, 
    alignItems: "flex-start",
  },
  headerSmallPhone: {
    padding: 10,
    paddingTop: 25,
    alignItems: "flex-start",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 15,
  },
  logoDesktop: {
    width: 80,
    height: 80,
    borderRadius: 25,
    marginRight: 20,
    marginTop: 45,
  },
  logoTablet: {
    width: 70,
    height: 70,
    borderRadius: 22,
    marginRight: 18,
  },
  logoPhone: {
    width: 50,
    height: 50,
    borderRadius: 18,
    marginRight: 12,
    marginTop: -15,
  },
  logoSmallPhone: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginRight: 10,
    marginTop: -15,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginLeft: 10,
    flex: 1,
  },
  headerTextDesktop: {
    fontSize: 38,
    marginLeft: 15,
    marginTop: 45,
  },
  headerTextTablet: {
    fontSize: 34,
    marginLeft: 12,
  },
  headerTextPhone: {
    fontSize: 26,
    marginLeft: 8,
    marginTop: -10,
  },
  headerTextSmallPhone: {
    fontSize: 22,
    marginLeft: 5,
    marginTop: -8,
  },
  closeDrawerButton: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -14 }],
    padding: 8,
  },
  closeDrawerButtonDesktop: {
    right: 10,
    padding: 10,
    top: "10%",
    transform: [{ translateY: -18 }],
  },
  closeDrawerButtonPhone: {
    right: 10,
    padding: 6,
    transform: [{ translateY: -12 }],
  },
  showMenuButton: {
    position: "absolute",
    left: 20,
    top: 40,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  showMenuButtonDesktop: {
    left: 30,
    top: 50,
    padding: 15,
    borderRadius: 40,
  },
  showMenuButtonTablet: {
    left: 25,
    top: 45,
    padding: 12,
    borderRadius: 35,
  },
  showMenuButtonPhone: {
    left: 15,
    top: 55, // Aumentado para estar más abajo en iPhones
    padding: 8,
    borderRadius: 25,
  },
  showMenuButtonSmallPhone: {
    left: 10,
    top: 50, // Aumentado para estar más abajo en teléfonos pequeños
    padding: 6,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  orientationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    padding: 20,
  },
  orientationText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
});