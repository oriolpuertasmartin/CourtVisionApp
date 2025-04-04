import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import PrimaryButton from "../../components/PrimaryButton";

export default function StartingPlayersScreen({ route, navigation }) {
  const { teamId: routeTeamId, updatedMatch } = route.params; // Recibe teamId y updatedMatch desde la navegación
  const teamId = routeTeamId || updatedMatch?.teamId; // Usa el teamId de updatedMatch si no se pasa directamente

  const [players, setPlayers] = useState([]); // Lista de jugadores del equipo
  const [selectedPlayers, setSelectedPlayers] = useState([]); // Jugadores seleccionados

  useEffect(() => {
    console.log("teamId recibido:", teamId); // Log para depuración
    console.log("updatedMatch recibido:", updatedMatch); // Log para depuración
  }, [teamId, updatedMatch]);

  // Fetch de jugadores al cargar la pantalla
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
        setPlayers(data); // Actualiza la lista de jugadores
      } catch (error) {
        console.error("Error fetching players:", error);
        Alert.alert("Error", "No se pudieron cargar los jugadores.");
      }
    }
    fetchPlayers();
  }, [teamId]);

  // Maneja la selección de jugadores
  const handleSelectPlayer = (player) => {
    if (selectedPlayers.includes(player._id)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== player._id));
    } else if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, player._id]);
    } else {
      Alert.alert("Límite alcanzado", "Solo puedes seleccionar 5 jugadores.");
    }
  };

  // Navega a la pantalla de estadísticas si se seleccionan 5 jugadores
  const handleStart = async () => {
    if (selectedPlayers.length === 5) {
      try {
        console.log("Jugadores seleccionados para guardar:", selectedPlayers); // Log para depuración
  
        // Actualizar los jugadores titulares en el partido
        const response = await fetch(`http://localhost:3001/matches/${updatedMatch._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startingPlayers: selectedPlayers }),
        });
        if (!response.ok) {
          throw new Error("Error al guardar los jugadores titulares.");
        }
        const updatedMatchResponse = await response.json();
        console.log("Partido actualizado:", updatedMatchResponse); // Log para depuración
  
        // Obtener todos los jugadores del equipo
        const playersResponse = await fetch(`http://localhost:3001/players/team/${teamId}`);
        if (!playersResponse.ok) {
          throw new Error("Error al obtener los jugadores del equipo.");
        }
        const allPlayers = await playersResponse.json();
        const allPlayerIds = allPlayers.map((player) => player._id);
  
        // Inicializar estadísticas de todos los jugadores
        const statsResponse = await fetch(`http://localhost:3001/playerstats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId: updatedMatch._id, playerIds: allPlayerIds }),
        });
        if (!statsResponse.ok) {
          throw new Error("Error al inicializar las estadísticas de los jugadores.");
        }
        console.log("Estadísticas inicializadas correctamente");
  
        Alert.alert("Éxito", "Jugadores titulares guardados correctamente.");
        navigation.navigate("StatsScreen", { selectedPlayers, matchId: updatedMatch._id, teamId });
      } catch (error) {
        console.error("Error al guardar los jugadores titulares:", error);
        Alert.alert("Error", "No se pudieron guardar los jugadores titulares.");
      }
    } else {
      Alert.alert("Selección incompleta", "Por favor selecciona 5 jugadores para comenzar.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Selector de jugadores */}
      <BoxSelector
        title="Selecciona los 5 jugadores titulares"
        items={players.map((player) => ({
          ...player,
          style: selectedPlayers.includes(player._id) ? styles.selectedPlayer : null,
        }))}
        onSelect={handleSelectPlayer}
      />

      {/* Botón para iniciar el partido */}
      <PrimaryButton
        title="Comenzar"
        onPress={handleStart}
        style={[styles.startButton, selectedPlayers.length !== 5 && styles.disabledButton]}
        textStyle={styles.startButtonText}
        disabled={selectedPlayers.length !== 5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  selectedPlayer: {
    backgroundColor: "orange",
  },
  startButton: {
    marginTop: 20,
    backgroundColor: "#FFA500",
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc", // Cambia el color del botón cuando está deshabilitado
  },
});