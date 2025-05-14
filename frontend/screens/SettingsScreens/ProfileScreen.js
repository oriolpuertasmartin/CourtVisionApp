import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../../config/apiConfig";
import { useNavigation } from "@react-navigation/native";
import SubpageTitle from "../../components/SubpageTitle";

export default function ProfileScreen({ setUser, route, navigation }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editableUser, setEditableUser] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    profile_photo: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Obtener el usuario del almacenamiento local
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserData(user);
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
      }
    };
    loadUser();
  }, []);

  // Consulta para obtener datos actualizados del perfil
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["user", userData?._id],
    queryFn: async () => {
      if (!userData?._id) return null;

      const response = await fetch(`${API_BASE_URL}/users/${userData._id}`);
      if (!response.ok) {
        throw new Error(`Error fetching profile: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!userData?._id,
    onSuccess: (data) => {
      // Actualizar tanto userData como editableUser cuando obtenemos nuevos datos
      if (data) {
        setUserData(data);
        setEditableUser({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          phone: data.phone || "",
          profile_photo: data.profile_photo || "",
        });

        // Actualizar el usuario en AsyncStorage
        AsyncStorage.setItem("user", JSON.stringify(data));
      }
    },
  });

  // Mutación para actualizar el perfil
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedData) => {
      if (!userData?._id) {
        throw new Error("No user ID available");
      }

      console.log("Actualizando perfil:", updatedData);

      const response = await fetch(`${API_BASE_URL}/users/${userData._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error updating profile: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // Actualizar los datos locales y en AsyncStorage
      setUserData(data);
      AsyncStorage.setItem("user", JSON.stringify(data));

      // Verificar que setUser existe antes de usarlo
      if (setUser) {
        setUser(data);
        console.log("Estado global de usuario actualizado");
      } else {
        console.warn("setUser no está disponible en ProfileScreen");
      }

      // Salir del modo edición
      setIsEditing(false);

      Alert.alert("Success", "Profile updated successfully!");
    },

    onError: (error) => {
      console.error("Error updating profile:", error);
      Alert.alert("Error", `Failed to update profile: ${error.message}`);
    },
  });

  // Función para seleccionar una imagen
  const pickImage = async () => {
    if (!isEditing) return;

    // Pedir permisos para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload a profile photo."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Data = result.assets[0].base64;

      // Verificar el tamaño de la imagen (limitar a 1MB)
      if (base64Data.length > 1000000) {
        Alert.alert(
          "Image too large",
          "Please select a smaller image (under 1MB)."
        );
        return;
      }

      // Extraer la extensión para el tipo MIME
      let fileExtension = "jpeg";
      try {
        const match = result.assets[0].uri.match(/\.([a-zA-Z0-9]+)$/);
        if (match && match[1]) {
          fileExtension = match[1].toLowerCase();
        }
      } catch (error) {
        console.log("Error extracting file extension:", error);
      }

      // Crear URL base64 con formato adecuado
      const imageUri = `data:image/${fileExtension};base64,${base64Data}`;
      setEditableUser((prev) => ({
        ...prev,
        profile_photo: imageUri,
      }));
      setImagePreview(result.assets[0].uri);
    }
  };

  // Función para iniciar la edición
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar edición y restaurar valores originales
      setEditableUser({
        name: userData?.name || "",
        email: userData?.email || "",
        username: userData?.username || "",
        phone: userData?.phone || "",
        profile_photo: userData?.profile_photo || "",
      });
      setImagePreview(userData?.profile_photo || null);
    } else {
      // Iniciar edición con valores actuales
      setEditableUser({
        name: userData?.name || "",
        email: userData?.email || "",
        username: userData?.username || "",
        phone: userData?.phone || "",
        profile_photo: userData?.profile_photo || "",
      });
      setImagePreview(userData?.profile_photo || null);
    }
    setIsEditing(!isEditing);
  };

  // Función para guardar cambios
  const handleSaveChanges = () => {
    // Verificar campos obligatorios
    if (!editableUser.name || !editableUser.email || !editableUser.username) {
      Alert.alert("Error", "Name, email and username are required fields");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editableUser.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // IMPORTANTE: Asegurarse de que phone sea siempre una cadena
    const updatedUser = {
      ...editableUser,
      phone: editableUser.phone ? String(editableUser.phone) : "",
    };

    updateProfile(updatedUser);
  };

  // Función para volver a la pantalla anterior
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Mostrar indicador de carga mientras se carga el perfil
  if (isProfileLoading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Mostrar error si hay problemas al cargar el perfil
  if (isProfileError && !userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {profileError?.message || "Error loading profile"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetchProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Botón de retroceso */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Usar el componente SubpageTitle */}
        <SubpageTitle>My Profile</SubpageTitle>

        {/* Sección de foto de perfil */}
        <TouchableOpacity
          style={styles.profilePhotoContainer}
          onPress={isEditing ? pickImage : undefined}
          activeOpacity={isEditing ? 0.7 : 1}
        >
          {imagePreview || userData?.profile_photo ? (
            <Image
              source={{ uri: imagePreview || userData?.profile_photo }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.placeholderText}>
                {userData?.name?.substring(0, 2).toUpperCase() || "U"}
              </Text>
            </View>
          )}

          {isEditing && (
            <View style={styles.editPhotoOverlay}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {isEditing && (
          <Text style={styles.tapToChangeText}>Tap to change photo</Text>
        )}

        {/* Botón de edición */}
        <TouchableOpacity
          style={[styles.editButton, isEditing ? styles.saveButton : null]}
          onPress={isEditing ? handleSaveChanges : handleEditToggle}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons
                name={isEditing ? "save-outline" : "create-outline"}
                size={20}
                color="white"
              />
              <Text style={styles.editButtonText}>
                {isEditing ? " Save" : " Edit Profile"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Botón de cancelar (solo visible en modo edición) */}
        {isEditing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleEditToggle}
            disabled={isUpdating}
          >
            <Ionicons name="close-outline" size={20} color="white" />
            <Text style={styles.editButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {/* Campos de información / edición */}
        <View style={styles.infoContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editableUser.name}
                onChangeText={(text) =>
                  setEditableUser((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter your full name"
              />
            ) : (
              <Text style={styles.infoValue}>
                {userData?.name || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Username</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editableUser.username}
                onChangeText={(text) =>
                  setEditableUser((prev) => ({ ...prev, username: text }))
                }
                placeholder="Enter your username"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.infoValue}>
                {userData?.username || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editableUser.email}
                onChangeText={(text) =>
                  setEditableUser((prev) => ({ ...prev, email: text }))
                }
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.infoValue}>
                {userData?.email || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editableUser.phone}
                onChangeText={(text) =>
                  setEditableUser((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>
                {userData?.phone || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Account Created</Text>
            <Text style={styles.infoValue}>
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>
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
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 80, // Mantener consistente con otras pantallas
    paddingHorizontal: 10,
    maxWidth: 1700, // Limita el ancho máximo del contenido
    alignSelf: "center", // Centra el contenedor si es más estrecho que la pantalla
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  profilePhotoContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFA50030",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFA500",
  },
  editPhotoOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFA500",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  tapToChangeText: {
    fontSize: 14,
    color: "#FFA500",
    marginBottom: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#999",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 25,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  infoSection: {
    marginBottom: 20,
    width: "100%",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    paddingVertical: 8,
  },
  input: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});