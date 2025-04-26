import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOrientation } from "../components/OrientationHandler";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const orientation = useOrientation(); // Usar el hook de orientación

  // Determinar si estamos en una pantalla pequeña (móvil)
  const isSmallScreen =
    Platform.OS !== "web" || (Platform.OS === "web" && window.innerWidth < 768);

  return (
    <View style={styles.screen}>
      {/* Logo o ícono de la app (puedes añadir uno real) */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>CV</Text>
        </View>
      </View>

      <Text style={styles.principalText}>Bienvenido a CourtVision</Text>
      <Text style={styles.subtitleText}>
        Estadísticas de baloncesto simplificadas
      </Text>

      <View
        style={[
          styles.box,
          orientation === "LANDSCAPE" && styles.boxLandscape,
          isSmallScreen && styles.boxSmallScreen,
        ]}
      >
        <View style={styles.mainbuttonbox}>
          <TouchableOpacity
            style={styles.buttonbox}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttontext}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mainbuttonbox}>
          <TouchableOpacity
            style={[styles.buttonbox, styles.registerButton]}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.buttontext}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2023 CourtVision App</Text>
        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFA500",
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFA500",
  },
  principalText: {
    fontSize: 40,
    color: "white",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 18,
    color: "white",
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.8,
  },
  box: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "30%",
    minWidth: 300,
    padding: 25,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  boxLandscape: {
    width: "40%",
    maxWidth: 500,
  },
  boxSmallScreen: {
    width: "90%",
  },
  mainbuttonbox: {
    alignItems: "center",
    width: "100%",
  },
  buttonbox: {
    backgroundColor: "#FFA500",
    borderRadius: 30,
    paddingVertical: 18,
    width: "100%",
    marginVertical: 10,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  registerButton: {
    backgroundColor: "#FF8C00", // Un tono diferente para el botón de registro
  },
  buttontext: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "white",
    opacity: 0.7,
  },
  versionText: {
    fontSize: 12,
    color: "white",
    opacity: 0.6,
    marginTop: 5,
  },
});
