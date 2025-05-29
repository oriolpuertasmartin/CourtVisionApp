import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import BoxSelector from "../../components/BoxSelector";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation } from "@tanstack/react-query";
import ScreenHeader from "../../components/ScreenHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function StartMatchScreen({ user, navigation }) {
  const deviceType = useDeviceType();
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

  // Consulta para obtener equipos del usuario
  const {
    data: teams = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["teams", user?._id],
    queryFn: async () => {
      if (!user || !user._id) {
        throw new Error("No se encontró el userId");
      }
      const response = await fetch(`${API_BASE_URL}/teams/user/${user._id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener equipos: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!user?._id,
  });

  // Mutación para crear un nuevo partido
  const { mutate: createMatch, isPending } = useMutation({
    mutationFn: async (teamId) => {
      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, userId: user._id }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el match");
      }

      return await response.json();
    },
    onSuccess: (newMatch) => {
      navigation.navigate("Start a Match", {
        screen: "OpponentTeam",
        params: { matchId: newMatch._id, teamId: newMatch.teamId },
      });
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo crear el partido.");
    },
  });

  const handleSelectTeam = (team) => {
    createMatch(team._id);
  };

  // Función para renderizar cada equipo con su logo/foto y categoría
  const renderTeamItem = (team, isSelected) => {
    const isDesktop = deviceType === "desktop";

    return (
      // Envuelve todo en TouchableOpacity para que siga siendo un botón
      <TouchableOpacity
        style={[styles.itemButton, isDesktop && styles.itemButtonDesktop]}
        onPress={() => handleSelectTeam(team)}
      >
        <View
          style={[
            styles.teamItemContainer,
            isSelected ? styles.selectedTeamItem : null,
            isDesktop && styles.teamItemContainerDesktop,
          ]}
        >
          {team.team_photo ? (
            <Image
              source={{ uri: team.team_photo }}
              style={[styles.teamLogo, isDesktop && styles.teamLogoDesktop]}
            />
          ) : (
            <View
              style={[
                styles.teamLogoPlaceholder,
                isDesktop && styles.teamLogoPlaceholderDesktop,
              ]}
            >
              <Text
                style={[
                  styles.teamLogoPlaceholderText,
                  isDesktop && { fontSize: 24 },
                ]}
              >
                {team.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.teamInfoContainer}>
            <Text
              style={[styles.teamName, isDesktop && styles.teamNameDesktop]}
            >
              {team.name}
            </Text>
            <Text
              style={[
                styles.teamCategory,
                isDesktop && styles.teamCategoryDesktop,
              ]}
            >
              {team.category || "Sin categoría"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading || isPending) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <ScreenHeader
          title="Select your team"
          showBackButton={false}
          isMainScreen={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Cargando equipos...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <ScreenHeader
          title="Select your Team"
          showBackButton={false}
          isMainScreen={true}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || "Error al cargar equipos"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      <ScreenHeader
        title="Select your Team"
        showBackButton={false}
        isMainScreen={true}
      />

      <View style={styles.content}>
        <View style={styles.boxSelectorContainer}>
          <BoxSelector
            items={teams}
            onSelect={handleSelectTeam}
            emptyMessage="No teams found. Create a team first!"
            customRenderItem={renderTeamItem}
          >
            <TouchableOpacity
              style={[
                styles.createButton,
                deviceType === "desktop" && styles.createButtonDesktop,
              ]}
              onPress={() => navigation.navigate("Teams")}
            >
              <Text
                style={[
                  styles.createButtonText,
                  deviceType === "desktop" && styles.createButtonTextDesktop,
                ]}
              >
                Create a new team
              </Text>
            </TouchableOpacity>
          </BoxSelector>
        </View>
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
  content: {
    width: "100%",
    maxWidth: "100%",
    padding: 20,
    paddingBottom: 20,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  boxSelectorContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Botón de creación actualizado para coincidir con TeamsScreen
  createButton: {
    backgroundColor: "#EB840B",
    paddingVertical: 20,
    borderRadius: 20,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  createButtonDesktop: {
    width: 500,
    paddingVertical: 24,
  },
  createButtonText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  createButtonTextDesktop: {
    fontSize: 22,
  },
  itemButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
  },
  itemButtonDesktop: {
    paddingVertical: 15,
    borderRadius: 12,
  },
  teamItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "100%",
  },
  teamItemContainerDesktop: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  selectedTeamItem: {
    backgroundColor: "#FFF8E1",
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 45,
    marginRight: 30,
    marginLeft: 30,
    borderWidth: 1,
    borderColor: "#E6E0CE",
  },
  teamLogoDesktop: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 40,
    marginLeft: 40,
  },
  teamLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  teamLogoPlaceholderDesktop: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  teamLogoPlaceholderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  teamInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  teamName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 3,
  },
  teamNameDesktop: {
    fontSize: 26,
    marginBottom: 5,
  },
  teamCategory: {
    fontSize: 17,
    color: "#777",
  },
  teamCategoryDesktop: {
    fontSize: 20,
  },
});
