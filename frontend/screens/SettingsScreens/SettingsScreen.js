import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useDeviceType, useScreenDimensions } from "../../components/ResponsiveUtils";
import HeaderTitle from "../../components/HeaderTitle";

export default function SettingsScreen({ handleLogout }) {
  const navigation = useNavigation();
  const deviceType = useDeviceType();
  const { width } = useScreenDimensions();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // Update screen dimensions on window resize (important for web)
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => {
      subscription.remove();
    };
  }, []);

  // Esta función maneja el cierre de sesión localmente
  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
        handleLogout();
      }
    } else {
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro que deseas cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Cerrar sesión", style: "destructive", onPress: handleLogout }
        ]
      );
    }
  };

  // Método de respaldo para cerrar sesión manualmente
  const logoutManually = async () => {
    try {
      await AsyncStorage.removeItem("user");
      console.log("Usuario eliminado del almacenamiento local");
      
      if (Platform.OS === 'web' && window) {
        window.location.href = "/";
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Welcome" }],
        });
      }
    } catch (error) {
      console.error("Error al cerrar sesión manualmente:", error);
      Alert.alert("Error", "No se pudo cerrar sesión. Intente de nuevo.");
    }
  };

  // Función para navegar a la pantalla de perfil
  const goToProfile = () => {
    navigation.navigate("Profile");
  };

  // Función para navegar a la pantalla de cambio de contraseña
  const goToChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#333" }) => {
    const isDesktop = deviceType === 'desktop';
    
    return (
      <TouchableOpacity 
        style={[
          styles.settingItem,
          isDesktop && styles.settingItemDesktop
        ]} 
        onPress={onPress}
      >
        <View style={[
          styles.iconContainer, 
          { backgroundColor: color + "20" },
          isDesktop && styles.iconContainerDesktop
        ]}>
          <Ionicons 
            name={icon} 
            size={isDesktop ? 28 : 24} 
            color={color} 
          />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[
            styles.settingTitle,
            isDesktop && styles.settingTitleDesktop
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.settingSubtitle,
              isDesktop && styles.settingSubtitleDesktop
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={isDesktop ? 28 : 24} 
          color="#999" 
        />
      </TouchableOpacity>
    );
  };

  // Determinar ancho dinámico basado en el tamaño de pantalla
  const contentMaxWidth = Platform.OS === 'web' ? 
    (width < 768 ? '100%' : 
     width < 1200 ? 900 : 
     width < 1600 ? 1100 : 1400) : 
    '100%';

  return (
    <View style={[
      styles.container,
      Platform.OS === 'web' && { width: '100%', maxWidth: '100%' }
    ]}>
      {/* Usar el componente HeaderTitle en lugar de Text */}
      <HeaderTitle>Configuración</HeaderTitle>
      
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={[
          styles.scrollContainer,
          Platform.OS === 'web' && { width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.settingsContainer,
          deviceType === 'desktop' && styles.desktopSettingsContainer
        ]}>
          <Text style={[
            styles.sectionTitle,
            deviceType === 'desktop' && styles.sectionTitleDesktop
          ]}>
            Cuenta
          </Text>

          <SettingItem
            icon="person-outline"
            title="Mi Perfil"
            subtitle="Editar nombre, foto, y información personal"
            onPress={goToProfile}
            color="#FFA500"
          />

          <SettingItem
            icon="lock-closed-outline"
            title="Cambiar Contraseña"
            subtitle="Actualizar tu contraseña de acceso"
            onPress={goToChangePassword}
            color="#4A90E2"
          />

          {/* Botón de cerrar sesión movido a la sección de cuenta */}
          <SettingItem
            icon="log-out-outline"
            title="Cerrar sesión"
            subtitle="Terminar la sesión actual en este dispositivo"
            onPress={confirmLogout}
            color="#D9534F" // Mantener el color rojo para indicar acción peligrosa
          />

          <View style={styles.separator} />

          <Text style={[
            styles.sectionTitle,
            deviceType === 'desktop' && styles.sectionTitleDesktop
          ]}>
            Aplicación
          </Text>

          <SettingItem
            icon="information-circle-outline"
            title="Acerca de"
            subtitle="Versión 1.0.0"
            onPress={() => navigation.navigate("Info")}
            color="#5AC8FA"
          />

          {/* Para depuración - Solo visible en desarrollo */}
          {__DEV__ && (
            <Text style={styles.debugText}>
              Plataforma: {Platform.OS} | 
              Tipo: {deviceType} | 
              Ancho: {screenWidth}px |
              Content Width: {contentMaxWidth}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 80,
    alignItems: "center",
    width: '100%',
  },
  webContainer: {
    alignItems: "center",
    width: '100%',
    maxWidth: '100%',
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  desktopScrollContainer: {
    width: "100%",
  },
  settingsContainer: {
    width: "100%",
  },
  desktopSettingsContainer: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    marginTop: 10,
    color: "#666",
  },
  sectionTitleDesktop: {
    fontSize: 22,
    marginTop: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItemDesktop: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconContainerDesktop: {
    width: 55,
    height: 55,
    borderRadius: 12,
    marginRight: 20,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  settingTitleDesktop: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  settingSubtitleDesktop: {
    fontSize: 16,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E1E1E1",
    width: "100%",
    marginVertical: 15,
  },
  debugText: {
    marginTop: 20,
    color: "#888",
    fontSize: 12,
    alignSelf: "center",
  },
});