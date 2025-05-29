import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useMutation } from "@tanstack/react-query";
import ImageUploader from "../../components/ImageUploader";
import ScreenHeader from "../../components/ScreenHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function OpponentTeamScreen({ route, navigation }) {
  const { matchId, teamId } = route.params;
  const deviceType = useDeviceType();

  // Para detectar el tamaño de la pantalla y ajustar el layout
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 768;

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    return () => subscription.remove();
  }, []);

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
    onError: () => {
      Alert.alert("Error", "No se pudieron actualizar los datos del partido");
    },
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
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
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      <ScreenHeader
        title="Opponent team"
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
      />

      <View style={styles.content}>
        {/* Formulario de información del equipo oponente */}
        <BoxFill
          fields={[
            { name: "nombre", placeholder: "Opponent Name *", required: true },
            { name: "category", placeholder: "Category" },
          ]}
          formData={formData}
          onChangeForm={setFormData}
        >
          {/* Cargador de imágenes */}
          <ImageUploader
            label="Team Logo"
            imagePreview={imagePreview}
            onImageSelected={(imageUri) =>
              setFormData({ ...formData, photo: imageUri })
            }
            size={120}
            containerStyle={{
              width: "100%",
              backgroundColor: "#FFF9E7",
              borderRadius: 12,
              padding: 10,
              marginVertical: 10,
              alignItems: "center",
            }}
          />

          {/* Botón para guardar */}
          <PrimaryButton
            title={isPending ? "Saving..." : "Save Opponent"}
            onPress={handleSubmit}
            style={styles.saveButton}
            disabled={isPending}
          />
        </BoxFill>
      </View>

      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    padding: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  saveButton: {
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
