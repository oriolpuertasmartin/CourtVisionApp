import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation } from "@tanstack/react-query";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";
import ScreenHeader from "../../components/ScreenHeader";

export default function StartingPlayers({ route, navigation }) {
  const { teamId: routeTeamId, updatedMatch } = route.params;
  const teamId = routeTeamId || updatedMatch?.teamId;
  const [selectedPlayers, setSelectedPlayers] = useState([]);
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

  // Consulta para obtener jugadores del equipo
  const {
    data: players = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["players", "team", teamId],
    queryFn: async () => {
      if (!teamId) {
        throw new Error("No se proporcionó un teamId válido");
      }

      const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
      if (!response.ok) {
        throw new Error(`Error al obtener los jugadores: ${response.status}`);
      }

      return await response.json();
    },
    enabled: !!teamId,
  });

  // Mutación para actualizar los jugadores titulares y crear estadísticas iniciales
  const { mutate: startMatch, isPending } = useMutation({
    mutationFn: async () => {
      // Paso 1: Actualizar los jugadores titulares
      const updateResponse = await fetch(
        `${API_BASE_URL}/matches/${updatedMatch._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startingPlayers: selectedPlayers }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Error al guardar los jugadores titulares");
      }

      const updatedMatchData = await updateResponse.json();

      // Paso 2: Obtener todos los jugadores del equipo
      const playersResponse = await fetch(
        `${API_BASE_URL}/players/team/${teamId}`
      );
      if (!playersResponse.ok) {
        throw new Error("Error al obtener los jugadores del equipo");
      }

      const allPlayers = await playersResponse.json();
      const allPlayerIds = allPlayers.map((player) => player._id);

      // Paso 3: Inicializar estadísticas de todos los jugadores y el oponente
      const statsResponse = await fetch(`${API_BASE_URL}/playerstats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: updatedMatch._id,
          playerIds: allPlayerIds,
        }),
      });

      if (!statsResponse.ok) {
        throw new Error("Error al inicializar las estadísticas");
      }

      // Paso 4: Inicializar estadísticas del oponente
      const opponentStatsResponse = await fetch(`${API_BASE_URL}/playerstats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: updatedMatch._id,
          playerIds: ["opponent"],
        }),
      });

      if (!opponentStatsResponse.ok) {
        throw new Error("Error al inicializar las estadísticas del oponente");
      }

      return updatedMatchData;
    },
    onSuccess: (data) => {
      Alert.alert("Éxito", "Jugadores titulares guardados correctamente");
      navigation.navigate("StatsScreen", {
        selectedPlayers,
        matchId: updatedMatch._id,
        teamId,
      });
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        `No se pudieron guardar los jugadores titulares: ${error.message}`
      );
    },
  });

  const handleSelectPlayer = (player) => {
    if (selectedPlayers.includes(player._id)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== player._id));
    } else if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, player._id]);
    } else {
      Alert.alert("Límite alcanzado", "Solo puedes seleccionar 5 jugadores.");
    }
  };

  const handleStart = () => {
    if (selectedPlayers.length === 5) {
      startMatch();
    } else {
      Alert.alert(
        "Selección incompleta",
        "Por favor selecciona 5 jugadores para comenzar."
      );
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función para renderizar cada jugador con su foto/número y posición
  const renderPlayerItem = (player) => {
    const isSelected = selectedPlayers.includes(player._id);
    const isSmallScreen = screenWidth < 480;

    return (
      <TouchableOpacity
        style={[styles.itemButton]}
        onPress={() => handleSelectPlayer(player)}
      >
        <View
          style={[
            styles.playerItemContainer,
            isSelected ? styles.selectedPlayerItem : null,
          ]}
        >
          {player.player_photo ? (
            <Image
              source={{ uri: player.player_photo }}
              style={[
                styles.playerPhoto,
                isSmallScreen && {
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  marginRight: 15,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.playerNumberCircle,
                isSmallScreen && {
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 15,
                  marginLeft: 10,
                },
              ]}
            >
              <Text
                style={[
                  styles.playerNumberText,
                  isSmallScreen && { fontSize: 18 },
                ]}
              >
                {player.number || "0"}
              </Text>
            </View>
          )}
          <View style={styles.playerInfoContainer}>
            <Text
              style={[styles.playerName, isSmallScreen && { fontSize: 18 }]}
            >
              {player.name}
            </Text>
            <Text
              style={[styles.playerPosition, isSmallScreen && { fontSize: 14 }]}
            >
              {player.position || "Sin posición"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Cargando jugadores...</Text>
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
            {error?.message || "Error al cargar jugadores"}
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
        title="Select the 5 starting players"
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
      />

      <View style={styles.content}>
        {/* Contador de jugadores seleccionados */}
        <Text style={styles.selectionCounter}>
          {selectedPlayers.length}/5 players selected
        </Text>

        <View
          style={[
            styles.boxSelectorContainer,
            isLargeScreen
              ? { width: "70%" }
              : screenWidth < 480
              ? { width: "95%" }
              : { width: "85%" },
            isLargeScreen ? { height: "65%" } : { height: "55%" },
          ]}
        >
          <BoxSelector
            items={players}
            onSelect={handleSelectPlayer}
            emptyMessage="No hay jugadores disponibles. Crea jugadores primero."
            customRenderItem={renderPlayerItem}
          >
            <PrimaryButton
              title={isPending ? "Guardando..." : "Comenzar partido"}
              onPress={handleStart}
              style={[
                styles.startButton,
                selectedPlayers.length !== 5 && styles.disabledButton,
                isLargeScreen
                  ? { width: "30%" }
                  : screenWidth < 480
                  ? { width: "60%" }
                  : { width: "40%" },
              ]}
              textStyle={styles.startButtonText}
              disabled={selectedPlayers.length !== 5 || isPending}
            />
          </BoxSelector>
        </View>
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
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    padding: 20,
    paddingBottom: 20,
    flex: 1,
    alignItems: "center",
  },
  selectionCounter: {
    fontSize: 20,
    color: "#666",
    marginBottom: 15,
    fontWeight: "500",
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    flex: 1,
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  boxSelectorContainer: {
    width: "85%",
    height: "60%",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  itemButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
  },
  playerItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "100%",
  },
  selectedPlayerItem: {
    backgroundColor: "#FFF8E1",
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  playerPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 30,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#E6E0CE",
  },
  playerNumberCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 30,
    marginLeft: 20,
  },
  playerNumberText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  playerInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  playerName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 3,
  },
  playerPosition: {
    fontSize: 17,
    color: "#777",
  },
  selectedPlayer: {
    backgroundColor: "orange",
  },
  startButton: {
    marginTop: 20,
    backgroundColor: "#FFA500",
    paddingHorizontal: 60,
    paddingVertical: 15,
    width: "30%",
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: "#ccc",
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
