import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useMutation } from "@tanstack/react-query";
import ScreenContainer from "../../components/ScreenContainer";
import ScreenHeader from "../../components/ScreenHeader";
import { useDeviceType } from "../../components/ResponsiveUtils";
import ImageUploader from "../../components/ImageUploader";

export default function CreateTeamScreen({ route, navigation }) {
  const { userId } = route.params;
  console.log("User ID recibido en CreateTeamsScreen:", userId);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    team_photo: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const deviceType = useDeviceType();

  // Para detectar el tamaño de la pantalla y ajustar el layout
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 768;

  // Actualizar dimensiones cuando cambie el tamaño de la pantalla
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

  // Usar useMutation para crear un equipo
  const { mutate: createTeam, isPending } = useMutation({
    mutationFn: async (teamData) => {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al crear el equipo:", errorText);
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
      console.error("Error en la mutación:", error);
      Alert.alert("Error", "Failed to create team");
    },
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // Validar campos obligatorios
    if (!formData.name || !formData.category) {
      Alert.alert(
        "Error",
        "Please fill in the required fields: Name and Category"
      );
      return;
    }

    // Log para verificar los datos enviados
    console.log("Datos enviados al servidor:", {
      ...formData,
      userId: userId,
    });

    // Ejecutar la mutación
    createTeam({
      ...formData,
      userId: userId,
    });
  };

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
      scrollable={true}
    >
      <ScreenHeader
        title="Create a new team"
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
      />

      <View style={styles.content}>
        {/* Formulario de información del equipo */}
        <BoxFill
          fields={[
            { name: "name", placeholder: "Team Name *", required: true },
            { name: "category", placeholder: "Category *", required: true },
          ]}
          formData={formData}
          onChangeForm={setFormData}
        >
          {/* Cargador de imágenes */}
          <ImageUploader
            label="Team Logo"
            imagePreview={imagePreview}
            onImageSelected={(imageUri) =>
              setFormData({ ...formData, team_photo: imageUri })
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

          {/* Botón para crear el equipo */}
          <PrimaryButton
            title={
              isPending ? "Creating..." : "Create the team and add players"
            }
            onPress={handleSubmit}
            style={styles.createButton}
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
