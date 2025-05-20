import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function ImageUploader({
  label = "Upload Image",
  onImageSelected,
  imagePreview = null,
  containerStyle = {},
  size = 120, // Tamaño de la imagen (ancho y alto)
}) {
  const [localImagePreview, setLocalImagePreview] = useState(imagePreview);

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
      quality: 0.2, // Calidad reducida (0.2 = 20% calidad)
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const base64Data = result.assets[0].base64;

      // Validar el tamaño de la imagen (limitar a ~800KB)
      if (base64Data && base64Data.length > 800000) {
        Alert.alert(
          "Image too large",
          "Please select a smaller image or use lower quality photos (under 1MB)."
        );
        return;
      }

      // Extraer la extensión del archivo
      let fileExtension = "png"; // Extensión por defecto
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

      // Actualizar la vista previa local
      setLocalImagePreview(result.assets[0].uri);

      // Notificar al componente padre
      onImageSelected(imageUri);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.imageContainer}>
        {localImagePreview ? (
          <Image
            source={{ uri: localImagePreview }}
            style={[
              styles.imagePreview,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <Ionicons name="image-outline" size={size * 0.4} color="#FFA500" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="cloud-upload-outline" size={20} color="white" />
          <Text style={styles.uploadButtonText}>{label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
  },
  imagePreview: {
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  imagePlaceholder: {
    backgroundColor: "#E6E0CE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  placeholderText: {
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
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
});