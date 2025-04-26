import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../../config/apiConfig";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

export default function OpponentTeamScreen({ route, navigation }) {
  const { matchId, teamId } = route.params;
  const [formData, setFormData] = useState({
    nombre: "",
    category: "",
    photo: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Mutación para actualizar el equipo oponente en el partido
  const { mutate: updateOpponentTeam, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentTeam: {
            name: data.nombre,
            category: data.category,
            photo: data.photo,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el partido");
      }

      return await response.json();
    },
    onSuccess: (updatedMatch) => {
      Alert.alert(
        "Actualizado",
        "Datos del partido actualizados correctamente"
      );
      navigation.navigate("StartingPlayers", { teamId, updatedMatch });
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudieron actualizar los datos del partido");
    },
  });

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
      quality: 0.2, // Calidad reducida para minimizar tamaño
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Data = result.assets[0].base64;

      // Verificar el tamaño de la imagen (limitar a ~800KB)
      if (base64Data.length > 800000) {
        Alert.alert(
          "Image too large",
          "Please select a smaller image or use lower quality photos (under 1MB)."
        );
        return;
      }

      // Extraer la extensión para el tipo MIME
      let fileExtension = "png";
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

      // Actualizar estado del formulario y la vista previa
      setFormData({
        ...formData,
        photo: imageUri,
      });
      setImagePreview(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    // Validamos que al menos haya un nombre
    if (!formData.nombre.trim()) {
      Alert.alert(
        "Datos incompletos",
        "Por favor ingresa al menos el nombre del equipo oponente"
      );
      return;
    }

    updateOpponentTeam(formData);
  };

  return (
    <View style={styles.container}>
      {/* Flecha de retroceso personalizada */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

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
        title="New match"
        fields={[
          { name: "nombre", placeholder: "Opponent Name" },
          { name: "category", placeholder: "Category" },
        ]}
        formData={formData}
        onChangeForm={setFormData}
      >
        <PrimaryButton
          title={isPending ? "Guardando..." : "Start the match"}
          onPress={handleSubmit}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
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
  imageSection: {
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
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
});
