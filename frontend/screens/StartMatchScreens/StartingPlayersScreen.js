import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation } from "@tanstack/react-query";
import SubpageTitle from "../../components/SubpageTitle";

export default function StartingPlayers({ route, navigation }) {
  const { teamId: routeTeamId, updatedMatch } = route.params;
  const teamId = routeTeamId || updatedMatch?.teamId;
  const [selectedPlayers, setSelectedPlayers] = useState([]);

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

  // Función para renderizar cada jugador con su foto/número y posición
  const renderPlayerItem = (player) => {
    const isSelected = selectedPlayers.includes(player._id);
    
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
            <Image source={{ uri: player.player_photo }} style={styles.playerPhoto} />
          ) : (
            <View style={styles.playerNumberCircle}>
              <Text style={styles.playerNumberText}>
                {player.number || "0"}
              </Text>
            </View>
          )}
          <View style={styles.playerInfoContainer}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPosition}>{player.position || "Sin posición"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando jugadores...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>
          {error?.message || "Error al cargar jugadores"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Usar el componente SubpageTitle */}
      <SubpageTitle>Select Starting Players</SubpageTitle>

      {/* Contador de jugadores seleccionados */}
      <Text style={styles.selectionCounter}>{selectedPlayers.length}/5 players selected</Text>
      
      <View style={styles.boxSelectorContainer}>
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
            ]}
            textStyle={styles.startButtonText}
            disabled={selectedPlayers.length !== 5 || isPending}
          />
        </BoxSelector>
      </View>

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
    backgroundColor: "white",
    paddingTop: 80, 
    alignItems: "center",
  },
  selectionCounter: {
    fontSize: 20,
    color: "#666",
    marginBottom: 15,
    fontWeight: "500",
  },
  loadingContainer: {
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
    width: "70%",
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
    width: '30%',
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