import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../../config/apiConfig";
import ScreenContainer from "../../components/ScreenContainer";
import ScreenHeader from "../../components/ScreenHeader";

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
  
  // Obtener dimensiones de pantalla para ajustes responsivos
  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth > 768;

  // Cargar el ID del usuario desde AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user._id);
          console.log("User ID loaded:", user._id);
        } else {
          console.warn("User information not found");
          Alert.alert("Error", "User information not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
        Alert.alert("Error", "Error loading user information");
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

      console.log("Sending password change request:", {
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
      console.log("Server response:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.message || "Failed to change password");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Password changed successfully:", data);
      Alert.alert("Success", "Your password has been changed successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      console.error("Error changing password:", error);
      Alert.alert("Error", error.message || "Could not change password");
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
      Alert.alert("Error", "All fields are required");
      return;
    }

    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (passwordData.newPassword.length < 6) {
      Alert.alert(
        "Error",
        "New password must be at least 6 characters long"
      );
      return;
    }

    // Validar que las contraseñas nuevas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    // Enviar la solicitud
    changePassword(passwordData);
  };

  // Calcular el ancho del formulario basado en el tamaño de pantalla
  const getFormWidth = () => {
    if (Platform.OS !== 'web') return "90%";
    
    if (screenWidth > 1600) return "50%";
    if (screenWidth > 1200) return "60%";
    if (screenWidth > 768) return "70%";
    return "90%";
  };

  return (
    <ScreenContainer 
      fullWidth={isLargeScreen} 
      contentContainerStyle={styles.contentContainer}
    >
      <ScreenHeader 
        title="Change Password" 
        onBack={handleGoBack} 
        isMainScreen={false}
      />

      <View style={[
        styles.formContainer,
        { width: getFormWidth() }
      ]}>
        {/* Campo para la contraseña actual */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Current Password</Text>
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
              placeholder="Enter your current password"
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
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={passwordData.newPassword}
              onChangeText={(text) =>
                setPasswordData((prev) => ({ ...prev, newPassword: text }))
              }
              placeholder="Enter your new password"
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
          <Text style={styles.passwordHint}>Minimum 6 characters</Text>
        </View>

        {/* Campo para confirmar la nueva contraseña */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
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
              placeholder="Confirm your new password"
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
          style={[
            styles.changePasswordButton,
            isPending && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="lock-closed-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Change Password</Text>
            </>
          )}
        </TouchableOpacity>
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
  formContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  inputSection: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
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
    color: "#333",
  },
  visibilityToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8, // Aumentado para mejor área táctil
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
    paddingVertical: 14, // Ligeramente más alto para mejor usabilidad
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 30,
    width: "100%",
    maxWidth: 300, // Consistente con botones de ProfileScreen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#FFCC80",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});