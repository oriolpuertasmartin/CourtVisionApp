import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

export default function CreateTeamScreen({ route, navigation }) {
  const { userId } = route.params;
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    team_photo: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Usar el hook de orientación
  const orientation = useOrientation();

  // Función para seleccionar una imagen
  const pickImage = async () => {
    // Pedir permisos para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload images."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2, // Reduced quality (0.2 = 20% quality)
      base64: true,
    });

    if (!result.cancelled && result.assets && result.assets[0]) {
      // Limit the image size by checking the base64 length
      const base64Data = result.assets[0].base64;

      // If the base64 string is too large (over ~800KB), compress further or alert the user
      if (base64Data && base64Data.length > 800000) {
        Alert.alert(
          "Image too large",
          "Please select a smaller image or use lower quality photos (under 1MB)."
        );
        return;
      }

      // Extract file extension reliably using a regex pattern
      let fileExtension = "png"; // Default extension
      try {
        const match = result.assets[0].uri.match(/\.([a-zA-Z0-9]+)$/);
        if (match && match[1]) {
          fileExtension = match[1].toLowerCase();
        }
      } catch (error) {
        console.log("Error extracting file extension:", error);
      }

      // Create base64 URL with proper format
      const imageUri = `data:image/${fileExtension};base64,${base64Data}`;
      setFormData({
        ...formData,
        team_photo: imageUri,
      });
      setImagePreview(result.assets[0].uri);
    }
  };

  // Usar useMutation para crear un equipo
  const { mutate: createTeam, isPending } = useMutation({
    mutationFn: async (teamData) => {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        throw new Error("Error creating team");
      }

      return await response.json();
    },
    onSuccess: (newTeam) => {
      // Redirigir automáticamente a la pantalla de añadir jugadores
      navigation.replace("CreatePlayer", {
        teamId: newTeam._id,
        teamName: newTeam.name,
        isNewTeam: true, // Flag para indicar que es un equipo recién creado
      });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create team");
    },
  });

  const handleSubmit = () => {
    // Validar campos obligatorios
    if (!formData.name || !formData.category) {
      Alert.alert(
        "Error",
        "Please fill in the required fields: Name and Category"
      );
      return;
    }

    // Ejecutar la mutación
    createTeam({
      ...formData,
      user_id: userId,
    });
  };

  return (
    <View style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Create New Team</Text>

      {/* Sección para subir imagen */}
      <View style={styles.imageSection}>
        {imagePreview ? (
          <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#FFA500" />
            <Text style={styles.imagePlaceholderText}>Team Logo</Text>
          </View>
        )}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="cloud-upload-outline" size={20} color="white" />
          <Text style={styles.uploadButtonText}>Upload Logo</Text>
        </TouchableOpacity>
      </View>

      <BoxFill
        title="Team Information"
        fields={[
          { name: "name", placeholder: "Team Name *", required: true },
          { name: "category", placeholder: "Category *", required: true },
        ]}
        formData={formData}
        onChangeForm={setFormData}
      >
        <PrimaryButton
          title={isPending ? "Creating..." : "Create Team & Add Players"}
          onPress={handleSubmit}
          style={styles.createButton}
          disabled={isPending}
        />
      </BoxFill>

      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
    paddingTop: 50,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 30,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E6E0CE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePlaceholderText: {
    marginTop: 5,
    color: "#FFA500",
    fontWeight: "bold",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 5,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  createButton: {
    backgroundColor: "#FFA500",
    marginTop: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
