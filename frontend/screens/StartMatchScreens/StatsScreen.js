import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import PlayerButton from "../../components/PlayerButton";
import StatsButtons from "../../components/StatsButtons";

export default function StatsScreen({ route }) {
  const { selectedPlayers, matchId, teamId } = route.params; // Asegúrate de que teamId esté disponible
  const [startingPlayers, setStartingPlayers] = useState([]); // Jugadores titulares
  const [benchPlayers, setBenchPlayers] = useState([]); // Jugadores suplentes
  const [selectedPlayerId, setSelectedPlayerId] = useState(null); // ID del jugador seleccionado
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    async function fetchPlayers() {
      try {
        if (!teamId) {
          Alert.alert("Error", "No se proporcionó un teamId válido.");
          return;
        }

        console.log("Fetching players for teamId:", teamId); // Log para depuración

        const response = await fetch(`http://localhost:3001/players/team/${teamId}`);
        if (!response.ok) {
          throw new Error("Error al obtener los jugadores del equipo.");
        }
        const data = await response.json();
        console.log("Players fetched:", data); // Log para depuración
        setBenchPlayers(data.filter((player) => !selectedPlayers.includes(player._id))); // Filtra los suplentes
      } catch (error) {
        console.error("Error fetching players:", error);
        Alert.alert("Error", "No se pudieron cargar los jugadores.");
      }
    }

    fetchPlayers();
  }, [teamId, selectedPlayers]);

  useEffect(() => {
    async function initializeAndFetchPlayers() {
      try {
        if (!matchId || selectedPlayers.length === 0) {
          throw new Error("matchId o selectedPlayers no están definidos.");
        }
  
        // Obtener estadísticas de los jugadores titulares
        const responseStarting = await fetch(
          `http://localhost:3001/playerstats?matchId=${matchId}&playerIds=${selectedPlayers.join(",")}`
        );
        if (!responseStarting.ok) {
          throw new Error("Error al obtener las estadísticas de los jugadores titulares.");
        }
        const startingStats = await responseStarting.json();
        console.log("Starting players stats fetched:", startingStats); // Log para depuración
  
        // Obtener detalles de los jugadores titulares
        const responsePlayers = await fetch(
          `http://localhost:3001/players?ids=${selectedPlayers.join(",")}`
        );
        if (!responsePlayers.ok) {
          throw new Error("Error al obtener los detalles de los jugadores titulares.");
        }
        const startingDetails = await responsePlayers.json();
        console.log("Starting players details fetched:", startingDetails); // Log para depuración
  
        // Combinar estadísticas y detalles
        const combinedStartingPlayers = startingStats.map((stat) => ({
          ...stat,
          ...startingDetails.find((player) => player._id === stat.playerId),
        }));
        setStartingPlayers(combinedStartingPlayers);
  
        // Obtener detalles de los suplentes
        const benchPlayers = await fetch(`http://localhost:3001/players/team/${teamId}`);
        const benchData = await benchPlayers.json();
        setBenchPlayers(benchData.filter((player) => !selectedPlayers.includes(player._id)));
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "No se pudieron cargar los datos necesarios.");
      } finally {
        setLoading(false);
      }
    }
  
    initializeAndFetchPlayers();
  }, [matchId, selectedPlayers]);

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId); // Alternar selección
  };

  const handleStatUpdate = async (stat) => {
    if (!selectedPlayerId) {
      Alert.alert("Jugador no seleccionado", "Por favor selecciona un jugador primero.");
      return;
    }
  
    try {
      // Encuentra el documento de estadísticas correspondiente al jugador seleccionado
      const playerStats = startingPlayers.find((player) => player.playerId === selectedPlayerId);
      if (!playerStats || !playerStats._id) {
        throw new Error("No se encontró el documento de estadísticas para el jugador seleccionado.");
      }
  
      let increment = 0;
      if (stat === "1pt") increment = 1;
      else if (stat === "2pt") increment = 2;
      else if (stat === "3pt") increment = 3;
  
      // Actualiza las estadísticas en el backend
      const response = await fetch(
        `http://localhost:3001/playerstats/${playerStats._id}`, // Usa el _id del documento de estadísticas
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: increment, [stat]: 1 }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al actualizar las estadísticas del jugador.");
      }
  
      console.log("Estadísticas actualizadas correctamente en el backend");
    } catch (error) {
      console.error("Error al actualizar las estadísticas:", error);
      Alert.alert("Error", "No se pudieron actualizar las estadísticas.");
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.title}>Stats Screen</Text>
        <View style={styles.startingplayersContainer}>
          {startingPlayers.map((player) => (
            <PlayerButton
              key={player.playerId}
              player={player}
              playerstats={player.stats}
              onPress={() => handleSelectPlayer(player.playerId)}
              isSelected={selectedPlayerId === player.playerId}
            />
          ))}
        </View>
      </View>

      <StatsButtons onStatPress={handleStatUpdate} />

      <View style={styles.bottomContainer}>
        <View style={styles.benchPlayersContainer}>
          {benchPlayers.map((player) => (
            <View key={player._id} style={styles.benchItem}>
              <PlayerButton
                player={player}
                playerstats={player.stats}
                onPress={() => handleSelectPlayer(player._id)}
                isSelected={selectedPlayerId === player._id}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  topContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    top: 20,
  },
  startingplayersContainer: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "absolute",
    top: 70,
    left: 50,
  },
  benchPlayersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "35%",
    position: "absolute",
    left: 0,
    paddingLeft: 48,
    gap: 5,
  },
  benchItem: {
    width: "48%",
    padding: 3,
    marginBottom: 1,
  },
});