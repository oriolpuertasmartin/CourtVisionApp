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
import { scale, conditionalScale } from "../../utils/responsive";

export default function OpponentTeamScreen({ route, navigation }) {
  const { matchId, teamId } = route.params;
  const deviceType = useDeviceType();

  // Para detectar el tamaño de la pantalla y ajustar el layout
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const isLargeScreen = screenWidth > 768;
  const isSmallScreen = screenWidth < 480;

  useEffect(() => {
    const updateDimensions = () => {
      const dimensions = Dimensions.get("window");
      setScreenWidth(dimensions.width);
      setScreenHeight(dimensions.height);
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
        throw new Error("Error updating match");
      }

      return await response.json();
    },
    onSuccess: (updatedMatch) => {
      Alert.alert(
        "Updated",
        "Match data updated successfully"
      );
      navigation.navigate("StartingPlayers", { teamId, updatedMatch });
    },
    onError: () => {
      Alert.alert("Error", "Could not update match data");
    },
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    if (!formData.nombre.trim()) {
      Alert.alert(
        "Incomplete Data",
        "Please enter at least the opponent team name"
      );
      return;
    }

    updateOpponentTeam(formData);
  };

  // Ajustar tamaños según el dispositivo
  const getImageSize = () => {
    if (isSmallScreen) return 80;
    if (!isLargeScreen) return 100;
    return 120;
  };

  return (
    <ScreenContainer
      scrollable={true}
      fullWidth={isLargeScreen}
      contentContainerStyle={[
        styles.contentContainer,
        isSmallScreen && { 
          paddingBottom: scale(80),
          paddingTop: 0, // Eliminamos padding superior para dispositivos pequeños
          marginTop: 0, // Eliminar cualquier margen superior adicional
        }
      ]}
      noTopPadding={isSmallScreen} // Importante: añadimos esta prop para pantallas pequeñas
    >
      <ScreenHeader
        title="Opponent team"
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
        // Ajuste más cerca al borde superior
        customStyle={isSmallScreen ? { top: scale(15) } : {}}
      />

      <View style={[
        styles.content,
        isSmallScreen && { 
          padding: scale(10),
          // Acercar mucho más el BoxFill al título
          marginTop: scale(-20),
          // Eliminar espacio adicional
          paddingTop: 0,
        }
      ]}>
        {/* Formulario de información del equipo oponente */}
        <BoxFill
          title="" // Eliminar el título del BoxFill porque ya usamos ScreenHeader
          fields={[
            { name: "nombre", placeholder: "Opponent Name *", required: true },
            { name: "category", placeholder: "Category" },
          ]}
          formData={formData}
          onChangeForm={setFormData}
          containerStyle={isSmallScreen ? styles.boxFillContainerSmall : styles.boxFillContainer}
        >
          {/* Cargador de imágenes */}
          <ImageUploader
            label="Team Logo"
            imagePreview={imagePreview}
            onImageSelected={(imageUri) =>
              setFormData({ ...formData, photo: imageUri })
            }
            size={getImageSize()}
            containerStyle={{
              width: "100%",
              backgroundColor: "#FFF9E7",
              borderRadius: 12,
              padding: isSmallScreen ? scale(5) : scale(10),
              marginVertical: isSmallScreen ? scale(5) : scale(10),
              alignItems: "center",
            }}
          />

          {/* Botón para guardar */}
          <PrimaryButton
            title={isPending ? "Saving..." : "Save Opponent"}
            onPress={handleSubmit}
            style={[
              styles.saveButton,
              isSmallScreen && { marginTop: scale(5), paddingVertical: scale(8) }
            ]}
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
    paddingBottom: 20,
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    padding: scale(15),
    paddingBottom: scale(20),
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
    marginTop: scale(10),
  },
  boxFillContainer: {
    marginVertical: scale(20),
  },
  boxFillContainerSmall: {
    marginVertical: scale(2), // Reducido de 5 a 2
    marginTop: 0,
    paddingTop: 0, // Asegurarse de que no hay padding superior
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