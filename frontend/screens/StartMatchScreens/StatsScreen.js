import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import PlayerButton from "../../components/PlayerButton";
import StatsButtons from "../../components/StatsButtons";
import Scoreboard from "../../components/ScoreBoard";
import PrimaryButton from "../../components/PrimaryButton";

// Solo para depuración - eliminarlo después
const mostrarAlerta = (titulo, mensaje) => {
  console.log(`ALERTA: ${titulo} - ${mensaje}`);
  try {
    Alert.alert(titulo, mensaje);
    console.log("Alert.alert ejecutado correctamente");
  } catch (error) {
    console.error("Error al mostrar la alerta:", error);
  }
};

export default function StatsScreen({ route, navigation }) {
  const { selectedPlayers, matchId, teamId } = route.params;
  const [startingPlayers, setStartingPlayers] = useState([]);
  const [benchPlayers, setBenchPlayers] = useState([]);
  const [benchStats, setBenchStats] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opponentsStats, setOpponentsStats] = useState(null);
  const [teamAName, setTeamAName] = useState("UAB");
  const [teamBName, setTeamBName] = useState("Opponent");
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [teamAFouls, setTeamAFouls] = useState(0);
  const [teamBFouls, setTeamBFouls] = useState(0);

  // En vez de obtener los datos del equipo por ID, 
  // obtenemos datos básicos del partido
  useEffect(() => {
    async function fetchMatchData() {
      try {
        // Obtener datos del partido
        if (matchId) {
          const matchRes = await fetch(`http://localhost:3001/matches/${matchId}`);
          if (matchRes.ok) {
            const matchData = await matchRes.json();
            
            // Inicializar puntuaciones y faltas si existen
            if (matchData.teamAScore !== undefined) setTeamAScore(matchData.teamAScore);
            if (matchData.teamBScore !== undefined) setTeamBScore(matchData.teamBScore);
            if (matchData.teamAFouls !== undefined) setTeamAFouls(matchData.teamAFouls);
            if (matchData.teamBFouls !== undefined) setTeamBFouls(matchData.teamBFouls);
            
            // Si hay equipo rival con nombre
            if (matchData.opponentTeam && matchData.opponentTeam.name) {
              setTeamBName(matchData.opponentTeam.name);
            }
          } else {
            console.log("No se pudo obtener información del partido");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del partido:", error);
      }
    }
    
    fetchMatchData();
  }, [matchId]);
  
  // Actualizar el partido cuando cambia la puntuación o las faltas
  useEffect(() => {
    const updateMatchScore = async () => {
      try {
        if (!matchId || loading) return;
        
        const response = await fetch(`http://localhost:3001/matches/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            teamAScore, 
            teamBScore,
            teamAFouls,
            teamBFouls
          }),
        });
        
        if (!response.ok) {
          console.error("Error al actualizar el marcador en el partido");
        }
      } catch (error) {
        console.error("Error al actualizar el marcador:", error);
      }
    };

    const saveTimeout = setTimeout(() => {
      if (!loading && matchId) updateMatchScore();
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [teamAScore, teamBScore, teamAFouls, teamBFouls, loading, matchId]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        if (!teamId) {
          Alert.alert("Error", "No se proporcionó un teamId válido.");
          return;
        }

        const response = await fetch(`http://localhost:3001/players/team/${teamId}`);
        if (!response.ok) throw new Error("Error al obtener los jugadores del equipo.");
        const data = await response.json();

        if (Array.isArray(data) && selectedPlayers && Array.isArray(selectedPlayers)) {
          setBenchPlayers(data.filter((player) => !selectedPlayers.includes(player._id)));
        } else {
          console.error("Datos de jugadores o selectedPlayers no válidos", { 
            dataIsArray: Array.isArray(data), 
            selectedPlayersIsArray: Array.isArray(selectedPlayers) 
          });
        }
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
        if (!matchId || !selectedPlayers || selectedPlayers.length === 0) {
          console.log("matchId o selectedPlayers no están definidos");
          setLoading(false);
          return;
        }

        // Fetch y combinar estadísticas de los jugadores titulares
        const responseStarting = await fetch(
          `http://localhost:3001/playerstats?matchId=${matchId}&playerIds=${selectedPlayers.join(",")}`
        );
        if (!responseStarting.ok) {
          throw new Error("Error al obtener las estadísticas de los jugadores titulares");
        }
        const startingStats = await responseStarting.json();

        const responsePlayers = await fetch(
          `http://localhost:3001/players?ids=${selectedPlayers.join(",")}`
        );
        if (!responsePlayers.ok) {
          throw new Error("Error al obtener los detalles de los jugadores titulares");
        }
        const startingDetails = await responsePlayers.json();

        const combinedStartingPlayers = startingStats.map((stat) => ({
          ...stat,
          ...startingDetails.find((player) => player._id === stat.playerId),
          statsId: stat._id,
        }));
        setStartingPlayers(combinedStartingPlayers);

        // Obtener jugadores del banquillo
        if (teamId) {
          const allPlayersRes = await fetch(`http://localhost:3001/players/team/${teamId}`);
          if (!allPlayersRes.ok) {
            throw new Error("Error al obtener todos los jugadores del equipo");
          }
          const allPlayersData = await allPlayersRes.json();
          const bench = allPlayersData.filter((player) => !selectedPlayers.includes(player._id));
          setBenchPlayers(bench);

          // Obtener estadísticas para jugadores del banquillo
          const benchIds = bench.map((p) => p._id);
          if (benchIds.length > 0) {
            const benchStatsRes = await fetch(
              `http://localhost:3001/playerstats?matchId=${matchId}&playerIds=${benchIds.join(",")}`
            );
            if (benchStatsRes.ok) {
              const stats = await benchStatsRes.json();
              const combined = stats.map((stat) => ({
                ...stat,
                ...bench.find((p) => p._id === stat.playerId),
                statsId: stat._id,
              }));
              setBenchStats(combined);
            }
          }
        }

        // Obtener estadísticas del equipo oponente
        const opponentStatsRes = await fetch(
          `http://localhost:3001/playerstats?matchId=${matchId}&playerIds=opponent`
        );
        if (opponentStatsRes.ok) {
          const opponentStats = await opponentStatsRes.json();
          if (opponentStats && opponentStats.length > 0) {
            setOpponentsStats({
              ...opponentStats[0],
              name: "Opponent Team",
              number: "",
              statsId: opponentStats[0]._id,
            });
          }
        }
        
        console.log("Estadísticas inicializadas correctamente");
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "No se pudieron cargar los datos necesarios.");
      } finally {
        setLoading(false);
      }
    }

    initializeAndFetchPlayers();
  }, [matchId, selectedPlayers, teamId]);

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId === selectedPlayerId ? null : playerId);
  };

  const handleStatUpdate = async (stat) => {
    if (!selectedPlayerId) {
      Alert.alert("Jugador no seleccionado", "Por favor selecciona un jugador primero.");
      return;
    }

    try {
      let playerStats;
      if (selectedPlayerId === "opponent") {
        playerStats = opponentsStats;
      } else {
        playerStats =
          startingPlayers.find((p) => p.playerId === selectedPlayerId) ||
          benchStats.find((p) => p.playerId === selectedPlayerId);
      }

      if (!playerStats || !playerStats.statsId) {
        throw new Error("No se encontró el documento de estadísticas para el jugador seleccionado.");
      }

      let payload = {};
      if (stat === "1pt") {
        payload = { points: 1, freeThrowsMade: 1, freeThrowsAttempted: 1 };
        // Actualizar marcador según el equipo
        if (selectedPlayerId === "opponent") {
          setTeamBScore(prev => prev + 1);
        } else {
          setTeamAScore(prev => prev + 1);
        }
      } else if (stat === "2pt") {
        payload = { points: 2, fieldGoalsMade: 1, fieldGoalsAttempted: 1 };
        // Actualizar marcador según el equipo
        if (selectedPlayerId === "opponent") {
          setTeamBScore(prev => prev + 2);
        } else {
          setTeamAScore(prev => prev + 2);
        }
      } else if (stat === "3pt") {
        payload = { points: 3, fieldGoalsMade: 1, fieldGoalsAttempted: 1 };
        // Actualizar marcador según el equipo
        if (selectedPlayerId === "opponent") {
          setTeamBScore(prev => prev + 3);
        } else {
          setTeamAScore(prev => prev + 3);
        }
      } else if (stat === "offRebounds" || stat === "defRebounds") {
        payload = { [stat]: 1, rebounds: 1 };
      } else if (stat === "fouls") {
        payload[stat] = 1;
        // Actualizar faltas según el equipo
        if (selectedPlayerId === "opponent") {
          setTeamBFouls(prev => prev + 1);
        } else {
          setTeamAFouls(prev => prev + 1);
        }
      } else {
        payload[stat] = 1;
      }

      const response = await fetch(
        `http://localhost:3001/playerstats/${playerStats.statsId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar las estadísticas del jugador.");
      }

      const updated = await response.json();

      if (selectedPlayerId === "opponent") {
        setOpponentsStats((prev) => ({ ...prev, ...updated }));
      } else if (startingPlayers.some((p) => p.statsId === updated._id)) {
        setStartingPlayers((prev) =>
          prev.map((p) => (p.statsId === updated._id ? { ...p, ...updated } : p))
        );
      } else {
        setBenchStats((prev) =>
          prev.map((p) => (p.statsId === updated._id ? { ...p, ...updated } : p))
        );
      }

      console.log("Estadísticas actualizadas correctamente");
    } catch (error) {
      console.error("Error al actualizar las estadísticas:", error);
      Alert.alert("Error", "No se pudieron actualizar las estadísticas.");
    }
  };

  // Función simplificada para pruebas
  const pruebaAlerta = () => {
    console.log("Prueba de alerta iniciada");
    try {
      Alert.alert(
        "Prueba",
        "Esta es una alerta de prueba",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancelar presionado"),
            style: "cancel"
          },
          {
            text: "OK",
            onPress: () => console.log("OK presionado")
          }
        ]
      );
      console.log("Alert.alert de prueba ejecutado correctamente");
    } catch (error) {
      console.error("Error en prueba de alerta:", error);
    }
  };

  // Versión alternativa que navega directamente a StatsView sin alertas
const finalizarPartidoDirecto = async () => {
  console.log("1. Iniciando finalización del partido (directo)");
  
  try {
    // Paso 1: Crear objeto de datos
    const updateData = { 
      status: "completed",
      teamAScore, 
      teamBScore,
      teamAFouls,
      teamBFouls
    };
    console.log("2. Datos preparados:", JSON.stringify(updateData));
    
    // Paso 2: Enviar solicitud al servidor
    console.log(`3. Enviando solicitud a ${matchId}`);
    const response = await fetch(`http://localhost:3001/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    console.log("4. Respuesta recibida:", response.status);
    
    // Paso 3: Verificar respuesta
    if (!response.ok) {
      console.error("5. Error en la respuesta");
      return;
    }
    
    // Paso 4: Procesar respuesta
    const data = await response.json();
    console.log("6. Datos recibidos:", JSON.stringify(data));
    
    // Paso 5: Navegar directamente a StatsView
    console.log("7. Navegando directamente a StatsView");
    
    navigation.reset({
      index: 0,
      routes: [
        { 
          name: 'Main',
          params: { 
            screen: 'Start a Match',
            params: {
              screen: 'StatsView',
              params: { matchId }
            }
          } 
        }
      ],
    });
    console.log("Navegación a StatsView ejecutada");
    
  } catch (error) {
    console.error("Error en finalizarPartidoDirecto:", error);
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
              playerstats={player}
              onPress={() => handleSelectPlayer(player.playerId)}
              isSelected={selectedPlayerId === player.playerId}
            />
          ))}
        </View>
      </View>

      {opponentsStats && (
        <View style={styles.opponentButtonContainer}>
          <PlayerButton
            key="opponent"
            player={{ name: "Opponent Team"}}
            playerstats={opponentsStats}
            onPress={() => handleSelectPlayer("opponent")}
            isSelected={selectedPlayerId === "opponent"}
          />
        </View>
      )}

      <View style={styles.scoreboardContainer}>
        <Scoreboard
          matchId={matchId}
          teamAName={teamAName}
          teamBName={teamBName}
          teamAScore={teamAScore}
          teamBScore={teamBScore}
          teamAFouls={teamAFouls}
          teamBFouls={teamBFouls}
          period="H1"
          initialTime="10:00"
        />

        {/* Botones de prueba y finalizar */}
        <View style={styles.finishButtonContainer}>
          <TouchableOpacity
            onPress={finalizarPartidoDirecto}
            style={{
              backgroundColor: "#D9534F",
              width: 300,
              marginTop: 15,
              paddingVertical: 12,
              borderRadius: 5,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: "bold",
              color: 'white'
            }}>
              Finish the match 
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatsButtons onStatPress={handleStatUpdate} />

      <View style={styles.bottomContainer}>
        <View style={styles.benchPlayersContainer}>
          {benchStats.map((player) => (
            <View key={player._id} style={styles.benchItem}>
              <PlayerButton
                player={player}
                playerstats={player}
                onPress={() => handleSelectPlayer(player.playerId)}
                isSelected={selectedPlayerId === player.playerId}
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
  opponentButtonContainer: {
    position: "absolute",
    top: 70,
    right: 50,
    zIndex: 10,
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
  scoreboardContainer: {
    position: "absolute",
    top: 400,
    right: 50,
    zIndex: 10,
  },
  finishButtonContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  finishButton: {
    backgroundColor: "#D9534F",
    width: 300,
    marginTop: 15,
    paddingVertical: 12,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});