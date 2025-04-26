import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useOrientation } from "../../components/OrientationHandler";

export default function SettingsScreen({ handleLogout }) {
  const navigation = useNavigation();
  const orientation = useOrientation();

  // Esta función maneja el cierre de sesión localmente
  const confirmLogout = () => {
    console.log("Botón de cerrar sesión presionado");
    console.log("handleLogout disponible:", !!handleLogout);

    // Comportamiento específico para plataforma web
    if (Platform.OS === "web") {
      // En web, usamos confirm nativo del navegador
      if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        console.log("Confirmación web recibida");
        if (handleLogout) {
          console.log("Usando handleLogout de App.js");
          handleLogout();
        } else {
          console.log("No se encontró handleLogout, usando logoutManually");
          logoutManually();
        }
      }
    } else {
      // Para móviles, seguimos usando Alert.alert
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro de que quieres cerrar sesión?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Sí, cerrar sesión",
            onPress: () => {
              console.log("Confirmación de cierre de sesión recibida");
              if (handleLogout) {
                console.log("Usando handleLogout de App.js");
                handleLogout();
              } else {
                console.log(
                  "No se encontró handleLogout, usando logoutManually"
                );
                logoutManually();
              }
            },
          },
        ]
      );
    }
  };

  // Método de respaldo para cerrar sesión manualmente
  const logoutManually = async () => {
    try {
      console.log("Ejecutando cierre de sesión manual");

      // Limpiar AsyncStorage
      await AsyncStorage.removeItem("user");
      console.log("Usuario eliminado de AsyncStorage");

      // En web, es posible que necesitemos un enfoque diferente
      if (Platform.OS === "web") {
        console.log("Plataforma web detectada, usando window.location");
        // Para web, podemos forzar una recarga completa
        window.location.href = "/";
        return;
      }

      // Para aplicaciones móviles, usamos la navegación estándar
      console.log("Navegando a Welcome usando navigation.reset");
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Error en logoutManually:", error);
      Alert.alert(
        "Error",
        "No se pudo cerrar sesión. Por favor, inténtalo de nuevo."
      );
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

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#333" }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Configuración</Text>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

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

          <Text style={styles.sectionTitle}>Aplicación</Text>

          <SettingItem
            icon="information-circle-outline"
            title="Acerca de"
            subtitle="Versión 1.0.0"
            onPress={() => navigation.navigate("Info")}
            color="#5AC8FA"
          />

          {/* Para depuración - Solo visible en desarrollo */}
          {__DEV__ && (
            <Text style={styles.debugText}>Plataforma: {Platform.OS}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 80,
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    alignSelf: "flex-start",
  },
  settingsContainer: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    marginTop: 10,
    color: "#666",
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
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#E1E1E1",
    width: "100%",
    marginVertical: 15,
  },
  logoutButton: {
    backgroundColor: "#D9534F",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: "100%",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 8,
  },
  debugText: {
    marginTop: 20,
    color: "#888",
    fontSize: 12,
    alignSelf: "center",
  },
});
