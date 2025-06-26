import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import PlayerButton from "../../components/PlayerButton";
import StatsButtons from "../../components/StatsButtons";
import Scoreboard from "../../components/ScoreBoard";
import API_BASE_URL from "../../config/apiConfig";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";
import ScreenHeader from "../../components/ScreenHeader";

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
  const deviceType = useDeviceType();

  // Responsive scale for components
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 768;

  // Calculate scale and size for responsive components
  const getComponentScale = () => {
    if (screenWidth < 400) return 0.7;
    if (screenWidth < 480) return 0.8;
    if (screenWidth < 768) return 1;
    if (screenWidth < 1200) return 1.2;
    return 1.4;
  };
  const componentScale = getComponentScale();

  const getPlayerButtonSize = () => {
    if (screenWidth < 400) return "xs";
    if (screenWidth < 480) return "small";
    if (screenWidth < 768) return "medium";
    if (screenWidth < 1200) return "large";
    return "xl";
  };
  const playerButtonSize = getPlayerButtonSize();

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

  useEffect(() => {
    async function fetchMatchData() {
      try {
        // Obtener datos del partido
        if (matchId) {
          const matchRes = await fetch(`${API_BASE_URL}/matches/${matchId}`);
          if (matchRes.ok) {
            const matchData = await matchRes.json();

            // Inicializar puntuaciones y faltas si existen
            if (matchData.teamAScore !== undefined)
              setTeamAScore(matchData.teamAScore);
            if (matchData.teamBScore !== undefined)
              setTeamBScore(matchData.teamBScore);
            if (matchData.teamAFouls !== undefined)
              setTeamAFouls(matchData.teamAFouls);
            if (matchData.teamBFouls !== undefined)
              setTeamBFouls(matchData.teamBFouls);

            // Si hay equipo rival con nombre, establecerlo
            if (matchData.opponentTeam && matchData.opponentTeam.name) {
              setTeamBName(matchData.opponentTeam.name);
            }

            // Obtener el nombre del equipo A
            if (matchData.teamId) {
              try {
                const teamRes = await fetch(
                  `${API_BASE_URL}/teams/${matchData.teamId}`
                );
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
            teamBFouls,
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
          Alert.alert("Error", "No valid teamId provided.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
        if (!response.ok) throw new Error("Error getting team players.");
        const data = await response.json();

        if (
          Array.isArray(data) &&
          selectedPlayers &&
          Array.isArray(selectedPlayers)
        ) {
          setBenchPlayers(
            data.filter((player) => !selectedPlayers.includes(player._id))
          );
        } else {
          console.error("Datos de jugadores o selectedPlayers no válidos", {
            dataIsArray: Array.isArray(data),
            selectedPlayersIsArray: Array.isArray(selectedPlayers),
          });
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        Alert.alert("Error", "Could not load players.");
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
          `${API_BASE_URL}/playerstats?matchId=${matchId}&playerIds=${selectedPlayers.join(
            ","
          )}`
        );
        if (!responseStarting.ok) {
          throw new Error(
            "Error al obtener las estadísticas de los jugadores titulares"
          );
        }
        const startingStats = await responseStarting.json();

        const responsePlayers = await fetch(
          `${API_BASE_URL}/players?ids=${selectedPlayers.join(",")}`
        );
        if (!responsePlayers.ok) {
          throw new Error(
            "Error al obtener los detalles de los jugadores titulares"
          );
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
          const allPlayersRes = await fetch(
            `${API_BASE_URL}/players/team/${teamId}`
          );
          if (!allPlayersRes.ok) {
            throw new Error("Error al obtener todos los jugadores del equipo");
          }
          const allPlayersData = await allPlayersRes.json();
          const bench = allPlayersData.filter(
            (player) => !selectedPlayers.includes(player._id)
          );
          setBenchPlayers(bench);

          // Obtener estadísticas para jugadores del banquillo
          const benchIds = bench.map((p) => p._id);
          if (benchIds.length > 0) {
            const benchStatsRes = await fetch(
              `${API_BASE_URL}/playerstats?matchId=${matchId}&playerIds=${benchIds.join(
                ","
              )}`
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
        Alert.alert("Error", "Could not load required data.");
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
      Alert.alert("Player not selected", "Please select a player first.");
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
        throw new Error("Stats document not found for the selected player.");
      }

      // Preparar el payload según el tipo de estadística
      let payload = {};

      // Estadísticas de tiros
      switch (stat) {
        // TIROS LIBRES (1 PUNTO)
        case "1ptmade": // Tiro libre acertado (verde)
          payload = {
            points: 1,
            freeThrowsMade: 1,
            freeThrowsAttempted: 1,
          };
          // Actualizar marcador
          if (selectedPlayerId === "opponent") {
            setTeamBScore((prev) => prev + 1);
          } else {
            setTeamAScore((prev) => prev + 1);
          }
          break;

        case "1ptmiss": // Tiro libre fallado (rojo)
          payload = {
            freeThrowsAttempted: 1,
          }; // Solo aumenta intentos, no puntos
          break;

        // TIROS DE 2 PUNTOS
        case "2ptmade": // Tiro de 2 acertado (verde)
          payload = {
            points: 2,
            fieldGoalsMade: 1,
            fieldGoalsAttempted: 1,
            twoPointsMade: 1,
            twoPointsAttempted: 1,
          };
          // Actualizar marcador
          if (selectedPlayerId === "opponent") {
            setTeamBScore((prev) => prev + 2);
          } else {
            setTeamAScore((prev) => prev + 2);
          }
          break;

        case "2ptmiss": // Tiro de 2 fallado (rojo)
          payload = {
            fieldGoalsAttempted: 1,
            twoPointsAttempted: 1,
          }; // Solo aumenta intentos
          break;

        // TIROS DE 3 PUNTOS
        case "3ptmade": // Triple acertado (verde)
          payload = {
            points: 3,
            fieldGoalsMade: 1,
            fieldGoalsAttempted: 1,
            threePointsMade: 1,
            threePointsAttempted: 1,
          };
          // Actualizar marcador
          if (selectedPlayerId === "opponent") {
            setTeamBScore((prev) => prev + 3);
          } else {
            setTeamAScore((prev) => prev + 3);
          }
          break;

        case "3ptmiss": // Triple fallado (rojo)
          payload = {
            fieldGoalsAttempted: 1,
            threePointsAttempted: 1,
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
            setTeamBFouls((prev) => prev + 1);
          } else {
            setTeamAFouls((prev) => prev + 1);
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
        throw new Error("Error updating player statistics.");
      }

      // Procesar respuesta y actualizar la interfaz
      const updated = await response.json();

      // Actualizar el estado local
      if (selectedPlayerId === "opponent") {
        setOpponentsStats((prev) => ({ ...prev, ...updated }));
      } else if (startingPlayers.some((p) => p.playerId === selectedPlayerId)) {
        setStartingPlayers((prev) =>
          prev.map((p) =>
            p.playerId === selectedPlayerId ? { ...p, ...updated } : p
          )
        );
      } else {
        setBenchStats((prev) =>
          prev.map((p) =>
            p.playerId === selectedPlayerId ? { ...p, ...updated } : p
          )
        );
      }

      console.log("Estadísticas actualizadas correctamente");
    } catch (error) {
      console.error("Error al actualizar las estadísticas:", error);
      Alert.alert("Error", "Could not update statistics.");
    }
  };

  // Función para finalizar partido y ver estadísticas
  const finalizarPartido = async () => {
    try {
      // Primero obtener el match actual para acceder a su historial de periodos
      const matchResponse = await fetch(`${API_BASE_URL}/matches/${matchId}`);
      if (!matchResponse.ok) {
        throw new Error("Error obteniendo datos del partido");
      }
      const matchData = await matchResponse.json();

      // Obtener el periodo actual
      const currentPeriod = matchData.currentPeriod || "H4";

      // Preparar el historial de periodos actualizado
      let updatedHistory = [...(matchData.periodsHistory || [])];
      const currentPeriodStats = {
        period: currentPeriod,
        teamAScore,
        teamBScore,
        teamAFouls,
        teamBFouls,
      };

      // Actualizar o agregar el periodo actual en el historial
      const existingIndex = updatedHistory.findIndex(
        (p) => p.period === currentPeriod
      );
      if (existingIndex >= 0) {
        updatedHistory[existingIndex] = currentPeriodStats;
      } else {
        updatedHistory.push(currentPeriodStats);
      }

      // Actualizar el partido con el estado final
      const updateData = {
        status: "completed",
        teamAScore,
        teamBScore,
        teamAFouls,
        teamBFouls,
        periodsHistory: updatedHistory,
      };

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Error finishing the match");
      }

      // El resto del código sigue igual...
      // Update team stats based on game result
      if (teamId) {
        const statsUpdate =
          teamAScore > teamBScore
            ? { incrementWins: 1 }
            : { incrementLosses: 1 };

        console.log("Enviando actualización de estadísticas:", statsUpdate);

        const teamStatsResponse = await fetch(
          `${API_BASE_URL}/teams/${teamId}/stats`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(statsUpdate),
          }
        );

        if (!teamStatsResponse.ok) {
          console.error("Error al actualizar estadísticas del equipo");
        } else {
          const updatedTeam = await teamStatsResponse.json();
          console.log("Respuesta actualización equipo:", updatedTeam);
          Alert.alert(
            "Team updated",
            `Wins: ${updatedTeam.wins}, Losses: ${updatedTeam.losses}`
          );
        }
      }

      // Navigate to stats view
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Main",
            params: {
              screen: "Start a Match",
              params: {
                screen: "StatsView",
                params: { matchId },
              },
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error al finalizar el partido:", error);
      Alert.alert("Error", "Could not finish the match correctly.");
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Renderizar el contenido diferente según el tamaño de pantalla
  const renderGameContent = () => {
    // Móvil pequeño
    if (screenWidth < 480) {
      return (
        <View style={styles.mobileContainer}>
          <ScrollView contentContainerStyle={styles.mobileScrollContent}>
            <View style={styles.mobileScoreboardContainer}>
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
                scale={0.5}
                width={300}
                compactMode={true}
              />
            </View>

            <View style={styles.mobilePlayerSection}>
              <Text style={styles.sectionTitle}>Starting Five</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {startingPlayers.map((player) => (
                  <View key={player.playerId} style={styles.mobilePlayerItem}>
                    <PlayerButton
                      player={player}
                      playerstats={player}
                      onPress={() => handleSelectPlayer(player.playerId)}
                      isSelected={selectedPlayerId === player.playerId}
                      size={playerButtonSize}
                      scale={componentScale}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {opponentsStats && (
              <View style={styles.mobileOpponentSection}>
                <Text style={styles.sectionTitle}>Opponent</Text>
                <View style={styles.mobileOpponentItem}>
                  <PlayerButton
                    key="opponent"
                    player={{
                      name: teamBName || "Opponent Team",
                      number: "",
                    }}
                    playerstats={opponentsStats}
                    onPress={() => handleSelectPlayer("opponent")}
                    isSelected={selectedPlayerId === "opponent"}
                    size={playerButtonSize}
                    scale={componentScale}
                  />
                </View>
              </View>
            )}

            <View style={styles.mobilePlayerSection}>
              <Text style={styles.sectionTitle}>Bench</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {benchStats.map((player) => (
                  <View key={player._id} style={styles.mobilePlayerItem}>
                    <PlayerButton
                      player={player}
                      playerstats={player}
                      onPress={() => handleSelectPlayer(player.playerId)}
                      isSelected={selectedPlayerId === player.playerId}
                      size={playerButtonSize}
                      scale={componentScale}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Botones para estadísticas */}
            <View style={styles.mobileStatsButtonsContainer}>
              <StatsButtons onStatPress={handleStatUpdate} isMobile={true} scale={componentScale} />
            </View>
          </ScrollView>
        </View>
      );
    }
    // Tablet o móvil grande
    else if (screenWidth < 768) {
      return (
        <View style={styles.tabletContainer}>
          <View style={styles.tabletTopSection}>
            <View style={styles.tabletStartingSection}>
              {startingPlayers.map((player) => (
                <View key={player.playerId} style={styles.tabletPlayerItem}>
                  <PlayerButton
                    player={player}
                    playerstats={player}
                    onPress={() => handleSelectPlayer(player.playerId)}
                    isSelected={selectedPlayerId === player.playerId}
                    size={playerButtonSize}
                    scale={componentScale}
                  />
                </View>
              ))}
            </View>

            {opponentsStats && (
              <View style={styles.tabletOpponentContainer}>
                <PlayerButton
                  key="opponent"
                  player={{
                    name: teamBName || "Opponent Team",
                    number: "",
                  }}
                  playerstats={opponentsStats}
                  onPress={() => handleSelectPlayer("opponent")}
                  isSelected={selectedPlayerId === "opponent"}
                  size={playerButtonSize}
                  scale={componentScale}
                />
              </View>
            )}
          </View>

          <View style={styles.tabletScoreboardContainer}>
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
              scale={componentScale}
              onFinish={finalizarPartido}
            />
          </View>

          <StatsButtons onStatPress={handleStatUpdate} scale={componentScale} />

          <View style={styles.tabletBottomContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {benchStats.map((player) => (
                <View key={player._id} style={styles.tabletBenchItem}>
                  <PlayerButton
                    player={player}
                    playerstats={player}
                    onPress={() => handleSelectPlayer(player.playerId)}
                    isSelected={selectedPlayerId === player.playerId}
                    size={playerButtonSize}
                    scale={componentScale}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      );
    }
    // Pantalla grande (desktop)
    else {
      return (
        <View style={styles.desktopContainer}>
          <View style={styles.topContainer}>
            <View style={styles.startingplayersContainer}>
              {startingPlayers.map((player) => (
                <View key={player.playerId} style={styles.startingPlayerItem}>
                  <PlayerButton
                    player={player}
                    playerstats={player}
                    onPress={() => handleSelectPlayer(player.playerId)}
                    isSelected={selectedPlayerId === player.playerId}
                    size={playerButtonSize}
                    scale={componentScale}
                  />
                </View>
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
                size={playerButtonSize}
                scale={componentScale}
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
              scale={componentScale}
              onFinish={finalizarPartido}
            />
          </View>

          <StatsButtons onStatPress={handleStatUpdate} scale={componentScale} />

          <View style={styles.bottomContainer}>
            <View style={styles.benchPlayersContainer}>
              {benchStats.map((player) => (
                <View key={player._id} style={styles.benchItem}>
                  <PlayerButton
                    player={player}
                    playerstats={player}
                    onPress={() => handleSelectPlayer(player.playerId)}
                    isSelected={selectedPlayerId === player.playerId}
                    size={playerButtonSize}
                    scale={componentScale}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
      scrollable={false}
    >
      <ScreenHeader
        title="Game Stats"
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
      />

      {/* Contenido principal adaptativo */}
      {renderGameContent()}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  // Estilos para versión Desktop
  desktopContainer: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
    position: "relative",
  },
  topContainer: {
    marginTop: 30,
    position: "relative",
    width: "100%",
    height: "30%",
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
  startingplayersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "35%",
    position: "absolute",
    top: 30,
    left: 80,
    gap: 10,
  },
  startingPlayerItem: {
    width: "47%",
    padding: 3,
    marginBottom: 10,
  },
  benchPlayersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "35%",
    position: "absolute",
    left: 80,
    gap: 10,
  },
  benchItem: {
    width: "47%",
    padding: 3,
    marginBottom: 10,
  },
  opponentButtonContainer: {
    position: "absolute",
    top: 90,
    right: 15,
    zIndex: 10,
    width: 400,
    transform: [{ scale: 1.5 }],
  },
  scoreboardContainer: {
    position: "absolute",
    top: 350,
    right: 80,
    zIndex: 10,
  },
  finishButton: {
    backgroundColor: "#D9534F",
    width: 300,
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  // Estilos para Tablet
  tabletContainer: {
    flex: 1,
    width: "100%",
    paddingTop: 20,
  },
  tabletTopSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabletStartingSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "60%",
  },
  tabletPlayerItem: {
    width: "33%",
    padding: 5,
    marginBottom: 10,
  },
  tabletOpponentContainer: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20,
  },
  tabletScoreboardContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  tabletBottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  tabletBenchItem: {
    width: 120,
    marginHorizontal: 5,
    padding: 5,
  },

  // Estilos para Móvil
  mobileContainer: {
    flex: 1,
    width: "100%",
  },
  mobileScrollContent: {
    padding: 10,
    paddingBottom: 50,
  },
  mobileScoreboardContainer: {
    alignItems: "center",
    marginVertical: 0,
    marginTop: -10,
    transform: [{ scale: 0.85 }],
  },
  mobilePlayerSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    paddingLeft: 10,
  },
  mobilePlayerItem: {
    width: 120,
    marginRight: 10,
    marginBottom: 10,
  },
  mobileOpponentSection: {
    marginVertical: 10,
  },
  mobileOpponentItem: {
    alignSelf: "center",
    marginVertical: 10,
    width: "80%",
  },
  mobileStatsButtonsContainer: {
    marginVertical: 20,
    alignItems: "center",
    transform: [{ scale: 0.8 }],
  },
});