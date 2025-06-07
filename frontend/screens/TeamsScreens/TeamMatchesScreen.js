import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery } from "@tanstack/react-query";
import ScreenContainer from "../../components/ScreenContainer";
import ScreenHeader from "../../components/ScreenHeader";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function TeamMatchesScreen({ route, navigation }) {
  const { teamId, userId } = route.params;
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

  // Usar el hook de orientación
  const orientation = useOrientation();

  // Consulta para obtener información del equipo
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
      if (!response.ok) {
        throw new Error(`Error loading team: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!teamId,
  });

  // Consulta para obtener todos los partidos
  const {
    data: allMatches = [],
    isLoading: isMatchesLoading,
    isError: isMatchesError,
    error: matchesError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/matches`);
      if (!response.ok) {
        throw new Error(`Error loading matches: ${response.status}`);
      }
      return await response.json();
    },
  });

  // Filtrar y formatear partidos
  const formattedMatches = React.useMemo(() => {
    if (!allMatches.length || !team) return [];

    // Filtrar los partidos que pertenecen a este equipo
    const teamMatches = allMatches
      .filter(
        (match) =>
          match.teamId === teamId ||
          (match.opponentTeam && match.opponentTeam._id === teamId)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar por fecha descendente

    // Formatear los partidos para el BoxSelector
    return teamMatches.map((match) => {
      const matchDate = new Date(match.date).toLocaleDateString();
      const status = match.status === "completed" ? "Final" : "In progress";

      return {
        _id: match._id,
        name: `${team?.name || "Team"} vs ${
          match.opponentTeam?.name || "Opponent"
        }`,
        subtitle: `${match.teamAScore || 0} - ${
          match.teamBScore || 0
        } • ${status} • ${matchDate}`,
        match: match, // Guardar el objeto completo para usarlo después
      };
    });
  }, [allMatches, team, teamId]);

  const handleSelectMatch = (match) => {
    navigation.navigate("StatsView", { matchId: match._id });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Determinar estado de carga y error general
  const isLoading = isTeamLoading || isMatchesLoading;
  const isError = isTeamError || isMatchesError;
  const errorMessage = teamError?.message || matchesError?.message;

  if (isLoading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Loading matches...</Text>
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {errorMessage || "Error loading matches"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchMatches()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
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
        title={team ? `${team.name} matches` : "team matches"}
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
      />

      <View style={styles.content}>
        <BoxSelector
          items={formattedMatches}
          onSelect={handleSelectMatch}
          emptyMessage="No matches found for this team"
        />
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  boxSelectorContainer: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
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
});