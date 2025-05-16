import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useDeviceType, useScreenDimensions } from "../../components/ResponsiveUtils";
import ScreenContainer from "../../components/ScreenContainer";
import HeaderTitle from "../../components/HeaderTitle"; 

export default function SettingsScreen({ handleLogout }) {
  const navigation = useNavigation();
  const deviceType = useDeviceType();
  const { width } = useScreenDimensions();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isLargeScreen = screenWidth > 768;

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

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      <HeaderTitle>Configuración</HeaderTitle>

      <View style={styles.content}>
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
            Ancho: {screenWidth}px
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    padding: 20,
    paddingBottom: 20,
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