import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import PlayerButton from "../../components/PlayerButton";
import StatsButtons from "../../components/StatsButtons";
import Scoreboard from "../../components/ScoreBoard";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";

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

  useEffect(() => {
    async function fetchMatchData() {
      try {
        // Obtener datos del partido
        if (matchId) {
          const matchRes = await fetch(`${API_BASE_URL}/matches/${matchId}`);
          if (matchRes.ok) {
            const matchData = await matchRes.json();
            
            // Inicializar puntuaciones y faltas si existen
            if (matchData.teamAScore !== undefined) setTeamAScore(matchData.teamAScore);
            if (matchData.teamBScore !== undefined) setTeamBScore(matchData.teamBScore);
            if (matchData.teamAFouls !== undefined) setTeamAFouls(matchData.teamAFouls);
            if (matchData.teamBFouls !== undefined) setTeamBFouls(matchData.teamBFouls);
            
            // Si hay equipo rival con nombre, establecerlo
            if (matchData.opponentTeam && matchData.opponentTeam.name) {
              setTeamBName(matchData.opponentTeam.name);
            }
            
            // Obtener el nombre del equipo A 
            if (matchData.teamId) {
              try {
                const teamRes = await fetch(`${API_BASE_URL}/teams/${matchData.teamId}`);
                if (teamRes.ok) {
                  const teamData = await teamRes.json();
                  if (teamData && teamData.name) {
                    setTeamAName(teamData.name);
                  }
                }
              } catch (error) {
                console.error("Error al obtener datos del equipo:", error);
              }
            }
          } else {
            console.log("No se pudo obtener información del partido");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del partido:", error);
      }
    }
    
    // Llamar a la función fetchMatchData
    fetchMatchData();
  }, [matchId]); // Agregar matchId como dependencia
  
  // Actualizar el partido cuando cambia la puntuación o las faltas
  useEffect(() => {
    const updateMatchScore = async () => {
      try {
        if (!matchId || loading) return;
        
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
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

        const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
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
          `${API_BASE_URL}/playerstats?matchId=${matchId}&playerIds=${selectedPlayers.join(",")}`
        );
        if (!responseStarting.ok) {
          throw new Error("Error al obtener las estadísticas de los jugadores titulares");
        }
        const startingStats = await responseStarting.json();

        const responsePlayers = await fetch(
          `${API_BASE_URL}/players?ids=${selectedPlayers.join(",")}`
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
          const allPlayersRes = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
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
              `${API_BASE_URL}/playerstats?matchId=${matchId}&playerIds=${benchIds.join(",")}`
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
          `${API_BASE_URL}/playerstats?matchId=${matchId}&playerIds=opponent`
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

  // Handler actualizado para procesar correctamente los tiros acertados y fallados
  const handleStatUpdate = async (stat) => {
    if (!selectedPlayerId) {
      Alert.alert("Jugador no seleccionado", "Por favor selecciona un jugador primero.");
      return;
    }
  
    try {
      // Buscar las estadísticas del jugador seleccionado
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
  
      // Preparar el payload según el tipo de estadística
      let payload = {};
      
      // Estadísticas de tiros
      switch(stat) {
        // TIROS LIBRES (1 PUNTO)
        case "1ptmade": // Tiro libre acertado (verde)
          payload = { 
            points: 1, 
            freeThrowsMade: 1, 
            freeThrowsAttempted: 1 
          };
          // Actualizar marcador
          if (selectedPlayerId === "opponent") {
            setTeamBScore(prev => prev + 1);
          } else {
            setTeamAScore(prev => prev + 1);
          }
          break;
          
        case "1ptmiss": // Tiro libre fallado (rojo)
          payload = { 
            freeThrowsAttempted: 1 
          }; // Solo aumenta intentos, no puntos
          break;
          
        // TIROS DE 2 PUNTOS
        case "2ptmade": // Tiro de 2 acertado (verde)
          payload = { 
            points: 2, 
            fieldGoalsMade: 1, 
            fieldGoalsAttempted: 1,
            twoPointsMade: 1,
            twoPointsAttempted: 1
          };
          // Actualizar marcador
          if (selectedPlayerId === "opponent") {
            setTeamBScore(prev => prev + 2);
          } else {
            setTeamAScore(prev => prev + 2);
          }
          break;
          
        case "2ptmiss": // Tiro de 2 fallado (rojo)
          payload = { 
            fieldGoalsAttempted: 1,
            twoPointsAttempted: 1
          }; // Solo aumenta intentos
          break;
          
        // TIROS DE 3 PUNTOS
        case "3ptmade": // Triple acertado (verde)
          payload = { 
            points: 3, 
            fieldGoalsMade: 1, 
            fieldGoalsAttempted: 1,
            threePointsMade: 1,
            threePointsAttempted: 1
          };
          // Actualizar marcador
          if (selectedPlayerId === "opponent") {
            setTeamBScore(prev => prev + 3);
          } else {
            setTeamAScore(prev => prev + 3);
          }
          break;
          
        case "3ptmiss": // Triple fallado (rojo)
          payload = { 
            fieldGoalsAttempted: 1,
            threePointsAttempted: 1
          }; // Solo aumenta intentos
          break;
          
        // REBOTES
        case "offRebounds":
          payload = { offRebounds: 1, rebounds: 1 };
          break;
          
        case "defRebounds":
          payload = { defRebounds: 1, rebounds: 1 };
          break;
          
        // FALTAS
        case "fouls":
          payload = { fouls: 1 };
          // Actualizar faltas según el equipo
          if (selectedPlayerId === "opponent") {
            setTeamBFouls(prev => prev + 1);
          } else {
            setTeamAFouls(prev => prev + 1);
          }
          break;
          
        // Otras estadísticas
        default:
          payload[stat] = 1;
      }
  
      // Enviar actualización al servidor
      const response = await fetch(
        `${API_BASE_URL}/playerstats/${playerStats.statsId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al actualizar las estadísticas del jugador.");
      }
  
      // Procesar respuesta y actualizar la interfaz
      const updated = await response.json();
      
      // Actualizar el estado local
      if (selectedPlayerId === "opponent") {
        setOpponentsStats(prev => ({...prev, ...updated}));
      } else if (startingPlayers.some(p => p.playerId === selectedPlayerId)) {
        setStartingPlayers(prev =>
          prev.map(p => p.playerId === selectedPlayerId ? {...p, ...updated} : p)
        );
      } else {
        setBenchStats(prev =>
          prev.map(p => p.playerId === selectedPlayerId ? {...p, ...updated} : p)
        );
      }
  
      console.log("Estadísticas actualizadas correctamente");
    } catch (error) {
      console.error("Error al actualizar las estadísticas:", error);
      Alert.alert("Error", "No se pudieron actualizar las estadísticas.");
    }
  };

  // Función para finalizar partido y ver estadísticas
  const finalizarPartido = async () => {
    try {
      const updateData = { 
        status: "completed",
        teamAScore, 
        teamBScore,
        teamAFouls,
        teamBFouls
      };
      
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error("Error al finalizar el partido");
      }
      
      // Update team stats based on game result
      if (teamId) {
        const statsUpdate = teamAScore > teamBScore 
          ? { incrementWins: 1 } 
          : { incrementLosses: 1 };

        console.log("Enviando actualización de estadísticas:", statsUpdate);
          
        const teamStatsResponse = await fetch(`${API_BASE_URL}/teams/${teamId}/stats`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statsUpdate),
        });
        
        if (!teamStatsResponse.ok) {
          console.error("Error al actualizar estadísticas del equipo");
        } else {
          const updatedTeam = await teamStatsResponse.json();
          console.log("Respuesta actualización equipo:", updatedTeam);
          Alert.alert("Equipo actualizado", 
            `Victorias: ${updatedTeam.wins}, Derrotas: ${updatedTeam.losses}`
          );
        }
      }
      
      // Navigate to stats view
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
    } catch (error) {
      console.error("Error al finalizar el partido:", error);
      Alert.alert("Error", "No se pudo finalizar el partido correctamente.");
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
            player={{ 
              name: teamBName || "Opponent Team",
              number: "",
            }}
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

        {/* Botón para finalizar partido */}
        <View style={styles.finishButtonContainer}>
          <TouchableOpacity
            onPress={finalizarPartido}
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