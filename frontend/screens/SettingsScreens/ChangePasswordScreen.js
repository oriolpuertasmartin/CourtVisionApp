import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../../config/apiConfig";
import SubpageTitle from "../../components/SubpageTitle";

export default function ChangePasswordScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cargar el ID del usuario desde AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user._id);
          console.log("ID de usuario cargado:", user._id);
        } else {
          console.warn("No se encontró información del usuario");
          Alert.alert("Error", "No se encontró información del usuario");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
        Alert.alert("Error", "Error al cargar la información del usuario");
        navigation.goBack();
      }
    };

    loadUser();
  }, []);

  // Mutación para cambiar la contraseña
  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: async (data) => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      console.log("Enviando solicitud de cambio de contraseña:", {
        userId,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        }
      );

      // Log de la respuesta
      console.log("Respuesta del servidor:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.message || "Failed to change password");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Contraseña cambiada exitosamente:", data);
      Alert.alert("Éxito", "Tu contraseña ha sido cambiada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      console.error("Error al cambiar la contraseña:", error);
      Alert.alert("Error", error.message || "No se pudo cambiar la contraseña");
    },
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // Validar campos
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (passwordData.newPassword.length < 6) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    // Validar que las contraseñas nuevas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden");
      return;
    }

    // Enviar la solicitud
    changePassword(passwordData);
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Botón de retroceso */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Usar el componente SubpageTitle */}
        <SubpageTitle>Cambiar Contraseña</SubpageTitle>

        <View style={styles.formContainer}>
          {/* Campo para la contraseña actual */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Contraseña Actual</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(text) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: text,
                  }))
                }
                placeholder="Ingresa tu contraseña actual"
                secureTextEntry={!showCurrentPassword}
                editable={!isPending}
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo para la nueva contraseña */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Nueva Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(text) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: text }))
                }
                placeholder="Ingresa tu nueva contraseña"
                secureTextEntry={!showNewPassword}
                editable={!isPending}
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordHint}>Mínimo 6 caracteres</Text>
          </View>

          {/* Campo para confirmar la nueva contraseña */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(text) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: text,
                  }))
                }
                placeholder="Confirma tu nueva contraseña"
                secureTextEntry={!showConfirmPassword}
                editable={!isPending}
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón de cambiar contraseña */}
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Cambiar Contraseña</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 80, 
    paddingHorizontal: Platform.OS === "web" ? "10%" : 30,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  inputSection: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  visibilityToggle: {
    paddingHorizontal: 12,
  },
  passwordHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 30,
    width: "100%",
    maxWidth: 400,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});