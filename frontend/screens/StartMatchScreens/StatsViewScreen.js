import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery } from "@tanstack/react-query";
import ScreenContainer from "../../components/ScreenContainer";
import ScreenHeader from "../../components/ScreenHeader";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function StatsView({ route, navigation }) {
  const { matchId } = route.params;
  const [teamName, setTeamName] = useState("My Team");
  const [topPerformers, setTopPerformers] = useState({
    points: { player: null, value: 0 },
    rebounds: { player: null, value: 0 },
    assists: { player: null, value: 0 },
    steals: { player: null, value: 0 },
    blocks: { player: null, value: 0 },
  });
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const deviceType = useDeviceType();

  // Para detectar el tamaño de la pantalla y ajustar el layout
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 768;
  const isSmallScreen = screenWidth < 480;

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

  // Consulta para obtener datos del partido
  const {
    data: match,
    isLoading: isMatchLoading,
    isError: isMatchError,
    error: matchError,
  } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`);
      if (!response.ok) {
        throw new Error(`Error loading match: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!matchId,
    refetchOnMount: "always", // Refrescar al montar
    staleTime: 0, // No usar caché
  });

  // Consulta para obtener el historial de períodos
  const { data: periodsHistory = [], isLoading: isPeriodsLoading } = useQuery({
    queryKey: ["periods", matchId],
    queryFn: async () => {
      if (match && match.periodsHistory) {
        return match.periodsHistory;
      }

      const response = await fetch(
        `${API_BASE_URL}/matches/${matchId}/periods`
      );
      if (!response.ok) {
        throw new Error(`Error loading periods: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!matchId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Process period history to show individual period scores instead of cumulative
  const processedPeriodsHistory = React.useMemo(() => {
    if (!periodsHistory || periodsHistory.length === 0) return [];

    // Sort periods in chronological order (H1, H2, H3, H4)
    const sortedPeriods = [...periodsHistory].sort((a, b) => {
      const periodOrder = { H1: 1, H2: 2, H3: 3, H4: 4 };
      return periodOrder[a.period] - periodOrder[b.period];
    });

    // Calculate per-period scores rather than cumulative scores
    let lastTeamAScore = 0;
    let lastTeamBScore = 0;

    return sortedPeriods.map((period, index) => {
      const periodScore = {
        ...period,
        periodTeamAScore:
          index === 0 ? period.teamAScore : period.teamAScore - lastTeamAScore,
        periodTeamBScore:
          index === 0 ? period.teamBScore : period.teamBScore - lastTeamBScore,
      };

      // Save current score as last score for next calculation
      lastTeamAScore = period.teamAScore;
      lastTeamBScore = period.teamBScore;

      return periodScore;
    });
  }, [periodsHistory]);

  // Consulta para obtener jugadores del equipo
  const { data: allPlayers = [], isLoading: isPlayersLoading } = useQuery({
    queryKey: ["allplayers", match?.teamId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/players/team/${match.teamId}`
      );
      if (!response.ok) {
        throw new Error(`Error loading players: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!match?.teamId,
  });

  // Consulta para obtener el equipo
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", match?.teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/teams/${match.teamId}`);
      if (!response.ok) {
        throw new Error(`Error loading team: ${response.status}`);
      }

      const teamData = await response.json();
      // Actualizamos el nombre del equipo
      setTeamName(teamData.name || "My Team");
      return teamData;
    },
    enabled: !!match?.teamId,
  });

  // Consulta para obtener las estadísticas de los jugadores
  const { data: allStatsData = [], isLoading: isStatsLoading } = useQuery({
    queryKey: [
      "playerstats",
      "match",
      matchId,
      allPlayers?.map((p) => p._id)?.join(","),
    ],
    queryFn: async () => {
      if (!allPlayers || allPlayers.length === 0) return [];

      const allPlayerIds = allPlayers.map((player) => player._id);

      const response = await fetch(
        `${API_BASE_URL}/playerstats?matchId=${matchId}&playerIds=${allPlayerIds.join(
          ","
        )}`
      );

      if (!response.ok) {
        throw new Error(`Error loading statistics: ${response.status}`);
      }

      return await response.json();
    },
    enabled: !!matchId && allPlayers.length > 0,
    onSuccess: (data) => {
      processPlayerStats(data);
    },
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Actualizar top performers cuando cambian las estadísticas o jugadores
  useEffect(() => {
    if (allStatsData && allStatsData.length > 0 && allPlayers && allPlayers.length > 0) {
      processPlayerStats(allStatsData);
    }
  }, [allStatsData, allPlayers]);

  // Función para procesar los datos de estadísticas y jugadores
  const processPlayerStats = (statsData) => {
    if (!statsData || !allPlayers) return;

    // Combinar estadísticas con información de jugadores
    const top = {
      points: { player: null, value: 0 },
      rebounds: { player: null, value: 0 },
      assists: { player: null, value: 0 },
      steals: { player: null, value: 0 },
      blocks: { player: null, value: 0 },
    };

    console.log("Processing stats data:", statsData.length, "players");

    statsData.forEach((player) => {
      // Máximo anotador
      if ((player.points || 0) > top.points.value) {
        const playerInfo = allPlayers.find((p) => p._id === player.playerId);
        if (playerInfo) {
          top.points = {
            player: `${playerInfo.name} #${playerInfo.number}`,
            value: player.points || 0,
          };
        }
      }

      // Máximo reboteador
      if ((player.rebounds || 0) > top.rebounds.value) {
        const playerInfo = allPlayers.find((p) => p._id === player.playerId);
        if (playerInfo) {
          top.rebounds = {
            player: `${playerInfo.name} #${playerInfo.number}`,
            value: player.rebounds || 0,
          };
        }
      }

      // Máximo asistente
      if ((player.assists || 0) > top.assists.value) {
        const playerInfo = allPlayers.find((p) => p._id === player.playerId);
        if (playerInfo) {
          top.assists = {
            player: `${playerInfo.name} #${playerInfo.number}`,
            value: player.assists || 0,
          };
        }
      }

      // Máximo en robos
      if ((player.steals || 0) > top.steals.value) {
        const playerInfo = allPlayers.find((p) => p._id === player.playerId);
        if (playerInfo) {
          top.steals = {
            player: `${playerInfo.name} #${playerInfo.number}`,
            value: player.steals || 0,
          };
        }
      }

      // Máximo en tapones
      if ((player.blocks || 0) > top.blocks.value) {
        const playerInfo = allPlayers.find((p) => p._id === player.playerId);
        if (playerInfo) {
          top.blocks = {
            player: `${playerInfo.name} #${playerInfo.number}`,
            value: player.blocks || 0,
          };
        }
      }
    });

    console.log("Top performers updated:", top);
    setTopPerformers(top);
  };

  // Procesamiento de los datos de los jugadores para la tabla
  const playerStats = React.useMemo(() => {
    if (!allStatsData.length || !allPlayers.length || !match) return [];

    // Combinar estadísticas con información de jugadores
    const combinedData = allStatsData.map((stat) => ({
      ...stat,
      ...allPlayers.find((p) => p._id === stat.playerId),
      isStarter: match.startingPlayers?.includes(stat.playerId),
    }));

    // Ordenar para que los titulares aparezcan primero
    return combinedData.sort((a, b) => {
      // Si uno es titular y otro no, el titular va primero
      if (a.isStarter && !b.isStarter) return -1;
      if (!a.isStarter && b.isStarter) return 1;

      // Si ambos son del mismo tipo, ordenar por puntos
      return (b.points || 0) - (a.points || 0);
    });
  }, [allStatsData, allPlayers, match]);

  // Simple función para volver a la pantalla principal
  const handleGoBack = () => {
    // Reset la navegación a la pantalla StartMatchScreen
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Main",
          params: {
            screen: "Start a Match",
          },
        },
      ],
    });
  };

  // Función para generar y exportar a PDF
  const generatePDF = async () => {
    // Verificar la plataforma
    if (Platform.OS === "web") {
      generatePDFForWeb();
    } else {
      generatePDFForMobile();
    }
  };

  // Función específica para generar PDF en navegadores web
  const generatePDFForWeb = () => {
    try {
      setGeneratingPDF(true);

      const matchDate = match?.date
        ? new Date(match.date).toLocaleDateString()
        : "No date";
      const fileName = `Statistics_${teamName.replace(/ /g, "_")}_vs_${(
        match?.opponentTeam?.name || "Opponent"
      ).replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}`;

      // HTML para el documento
      const htmlContent = generateHTMLContent(matchDate);

      // Crear un iframe oculto para poder imprimir/guardar como PDF
      const printIframe = document.createElement("iframe");
      printIframe.style.position = "absolute";
      printIframe.style.top = "-1000px";
      printIframe.style.left = "-1000px";
      document.body.appendChild(printIframe);

      printIframe.contentDocument.write(htmlContent);
      printIframe.contentDocument.close();

      // Una vez que el iframe está cargado, imprimimos
      printIframe.onload = () => {
        setTimeout(() => {
          try {
            printIframe.contentWindow.print();

            // Eliminamos el iframe después de un tiempo
            setTimeout(() => {
              document.body.removeChild(printIframe);
              setGeneratingPDF(false);
            }, 1000);
          } catch (error) {
            console.error("Error printing:", error);
            setGeneratingPDF(false);
            Alert.alert("Error", "Could not generate PDF: " + error.message);
          }
        }, 500);
      };
    } catch (error) {
      console.error("Error generating PDF in web:", error);
      setGeneratingPDF(false);
      Alert.alert("Error", "Could not generate PDF: " + error.message);
    }
  };

  // Función específica para generar PDF en dispositivos móviles
  const generatePDFForMobile = async () => {
    try {
      setGeneratingPDF(true);

      // Importaciones dinámicas para dispositivos móviles
      const RNHTMLtoPDF = require("react-native-html-to-pdf").default;
      const Sharing = require("expo-sharing");

      // Fecha del partido formateada
      const matchDate = match?.date
        ? new Date(match.date).toLocaleDateString()
        : "No date";

      // Generar HTML para el PDF
      const htmlContent = generateHTMLContent(matchDate);

      // Crear nombre de archivo basado en los equipos y la fecha
      const fileName = `Statistics_${teamName.replace(/ /g, "_")}_vs_${(
        match?.opponentTeam?.name || "Opponent"
      ).replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}`;

      // Opciones para generar el PDF
      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: "Documents",
        base64: false,
      };

      // Generar el PDF
      const file = await RNHTMLtoPDF.convert(options);

      // Compartir el archivo PDF
      if (file && file.filePath) {
        console.log("PDF generated:", file.filePath);

        if (Platform.OS === "ios") {
          // En iOS, usamos la API de compartir
          await Sharing.shareAsync(file.filePath);
        } else {
          // En Android, mostramos la ruta y un mensaje
          Alert.alert("PDF Generated", `PDF saved at: ${file.filePath}`, [
            { text: "OK" },
          ]);
        }
      }
    } catch (error) {
      console.error("Error generating PDF on mobile:", error);
      Alert.alert("Error", "Could not generate PDF: " + error.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Función para generar el contenido HTML compartido entre web y móvil
  const generateHTMLContent = (matchDate) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Match Statistics</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .score {
            font-size: 28px;
            font-weight: bold;
            margin: 15px 0;
          }
          h2 {
            background-color: #FFA500;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            margin-top: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #FFA500;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 12px;
          }
          td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: center;
            font-size: 11px;
          }
          .player-name {
            text-align: left;
            font-weight: bold;
          }
          .starter-row {
            background-color: white;
          }
          .bench-row {
            background-color: #f9f9f9;
          }
          .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Match Summary</div>
          <div class="subtitle">${matchDate}</div>
          <div class="subtitle">${teamName} vs ${
      match?.opponentTeam?.name || "Opponent"
    }</div>
          <div class="score">${match?.teamAScore || 0} - ${
      match?.teamBScore || 0
    }</div>
        </div>

        <h2>Points by Period</h2>
        <table>
          <tr>
            <th>Period</th>
            <th>${teamName}</th>
            <th>${match?.opponentTeam?.name || "Opponent"}</th>
          </tr>
          ${processedPeriodsHistory
            .map(
              (period) => `
            <tr>
              <td>${period.period}</td>
              <td>${period.periodTeamAScore}</td>
              <td>${period.periodTeamBScore}</td>
            </tr>
          `
            )
            .join("")}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${match?.teamAScore || 0}</td>
            <td>${match?.teamBScore || 0}</td>
          </tr>
        </table>

        <h2>Top Performers</h2>
        <table>
          <tr>
            <th>Category</th>
            <th>Player</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Points</td>
            <td>${topPerformers.points.player || "N/A"}</td>
            <td>${topPerformers.points.value || 0}</td>
          </tr>
          <tr>
            <td>Rebounds</td>
            <td>${topPerformers.rebounds.player || "N/A"}</td>
            <td>${topPerformers.rebounds.value || 0}</td>
          </tr>
          <tr>
            <td>Assists</td>
            <td>${topPerformers.assists.player || "N/A"}</td>
            <td>${topPerformers.assists.value || 0}</td>
          </tr>
          <tr>
            <td>Steals</td>
            <td>${topPerformers.steals.player || "N/A"}</td>
            <td>${topPerformers.steals.value || 0}</td>
          </tr>
          <tr>
            <td>Blocks</td>
            <td>${topPerformers.blocks.player || "N/A"}</td>
            <td>${topPerformers.blocks.value || 0}</td>
          </tr>
        </table>

        <h2>Team Statistics</h2>
        <table>
          <tr>
            <th>Player</th>
            <th>PTS</th>
            <th>FG</th>
            <th>%FG</th>
            <th>2P</th>
            <th>%2P</th>
            <th>3P</th>
            <th>%3P</th>
            <th>FT</th>
            <th>%FT</th>
            <th>REB</th>
            <th>DREB</th>
            <th>OREB</th>
            <th>AST</th>
            <th>STL</th>
            <th>BLK</th>
            <th>TO</th>
            <th>PF</th>
            <th>PIR</th>
            <th>A/T</th>
          </tr>
          ${playerStats
            .map((player) => {
              // Calcular porcentajes
              const fgPct =
                player.fieldGoalsAttempted > 0
                  ? Math.round(
                      (player.fieldGoalsMade / player.fieldGoalsAttempted) * 100
                    )
                  : 0;

              const ftPct =
                player.freeThrowsAttempted > 0
                  ? Math.round(
                      (player.freeThrowsMade / player.freeThrowsAttempted) * 100
                    )
                  : 0;

              const twoPct =
                player.twoPointsAttempted > 0
                  ? Math.round(
                      (player.twoPointsMade / player.twoPointsAttempted) * 100
                    )
                  : 0;

              const threePct =
                player.threePointsAttempted > 0
                  ? Math.round(
                      (player.threePointsMade / player.threePointsAttempted) *
                        100
                    )
                  : 0;

              return `
              <tr class="${player.isStarter ? "starter-row" : "bench-row"}">
                <td class="player-name">${player.name || "Player"} #${
                player.number || "0"
              }</td>
                <td>${player.points || 0}</td>
                <td>${player.fieldGoalsMade || 0}/${
                player.fieldGoalsAttempted || 0
              }</td>
                <td>${fgPct}%</td>
                <td>${player.twoPointsMade || 0}/${
                player.twoPointsAttempted || 0
              }</td>
                <td>${twoPct}%</td>
                <td>${player.threePointsMade || 0}/${
                player.threePointsAttempted || 0
              }</td>
                <td>${threePct}%</td>
                <td>${player.freeThrowsMade || 0}/${
                player.freeThrowsAttempted || 0
              }</td>
                <td>${ftPct}%</td>
                <td>${player.rebounds || 0}</td>
                <td>${player.defRebounds || 0}</td>
                <td>${player.offRebounds || 0}</td>
                <td>${player.assists || 0}</td>
                <td>${player.steals || 0}</td>
                <td>${player.blocks || 0}</td>
                <td>${player.turnovers || 0}</td>
                <td>${player.fouls || 0}</td>
                <td>${player.pir || 0}</td>
                <td>${player.assistToTurnoverRatio || 0}</td>
              </tr>
            `;
            })
            .join("")}
        </table>

        <div class="footer">
          Generated by CourtVisionApp - ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
  };

  // Renderizar contenido adaptativo según el tamaño de la pantalla
  const renderResponsiveContent = () => {
    return (
      <ScrollView>
        {/* Tabla de puntos por períodos */}
        <Text
          style={[
            styles.sectionTitle,
            isSmallScreen && { fontSize: 18, marginTop: 10 },
          ]}
        >
          Points by Period
        </Text>

        <View
          style={[
            styles.periodsTable,
            isSmallScreen && { marginHorizontal: 5 },
          ]}
        >
          <View style={styles.periodsHeader}>
            <Text style={styles.periodHeaderCell}>Period</Text>
            <Text style={styles.periodHeaderCell}>{teamName}</Text>
            <Text style={styles.periodHeaderCell}>
              {match?.opponentTeam?.name || "Opponent"}
            </Text>
          </View>

          {processedPeriodsHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No period data available</Text>
            </View>
          ) : (
            <>
              {/* Filas con datos de cada período */}
              {processedPeriodsHistory.map((period, index) => (
                <View key={index} style={styles.periodRow}>
                  <Text style={styles.periodCell}>{period.period}</Text>
                  <Text style={styles.periodCell}>
                    {period.periodTeamAScore}
                  </Text>
                  <Text style={styles.periodCell}>
                    {period.periodTeamBScore}
                  </Text>
                </View>
              ))}

              {/* Fila del total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalCell}>TOTAL</Text>
                <Text style={styles.totalCell}>{match?.teamAScore || 0}</Text>
                <Text style={styles.totalCell}>{match?.teamBScore || 0}</Text>
              </View>
            </>
          )}
        </View>

        {/* Jugadores Destacados */}
        <Text
          style={[
            styles.sectionTitle,
            isSmallScreen && { fontSize: 18, marginTop: 10 },
          ]}
        >
          Top Performers
        </Text>

        <View
          style={[
            styles.topPerformersTable,
            isSmallScreen && { marginHorizontal: 5 },
          ]}
        >
          <View style={styles.topPerformersHeader}>
            <Text style={styles.topHeaderCell}>Category</Text>
            <Text style={styles.topHeaderCell}>Player</Text>
            <Text style={styles.topHeaderCell}>Value</Text>
          </View>

          {/* Filas con los jugadores destacados */}
          {Object.entries(topPerformers).map(([category, data], index) => (
            <View key={index} style={styles.topPerformerRow}>
              <Text style={styles.topPerformerCategory}>
                {category === "points"
                  ? "Points"
                  : category === "rebounds"
                  ? "Rebounds"
                  : category === "assists"
                  ? "Assists"
                  : category === "steals"
                  ? "Steals"
                  : category === "blocks"
                  ? "Blocks"
                  : category}
              </Text>
              <Text style={styles.topPerformerPlayer}>
                {data.player || "N/A"}
              </Text>
              <Text style={styles.topPerformerValue}>{data.value || 0}</Text>
            </View>
          ))}
        </View>

        {/* Tabla de estadísticas globales - esta es la parte más densa */}
        <Text
          style={[
            styles.sectionTitle,
            isSmallScreen && { fontSize: 18, marginTop: 10 },
          ]}
        >
          Team Statistics
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View
            style={[
              styles.statsTable,
              isSmallScreen && { width: 1200 }, // Más ancho para móviles pequeños para ver toda la tabla
            ]}
          >
            {/* Encabezados de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.playerCell]}>Player</Text>
              <Text style={styles.headerCell}>PTS</Text>

              {/* Tiros divididos por tipo */}
              <Text style={styles.headerCell}>FG</Text>
              <Text style={styles.headerCell}>%FG</Text>
              <Text style={styles.headerCell}>2P</Text>
              <Text style={styles.headerCell}>%2P</Text>
              <Text style={styles.headerCell}>3P</Text>
              <Text style={styles.headerCell}>%3P</Text>
              <Text style={styles.headerCell}>FT</Text>
              <Text style={styles.headerCell}>%FT</Text>

              {/* Rebotes */}
              <Text style={styles.headerCell}>REB</Text>
              <Text style={styles.headerCell}>DREB</Text>
              <Text style={styles.headerCell}>OREB</Text>

              {/* Otras estadísticas */}
              <Text style={styles.headerCell}>AST</Text>
              <Text style={styles.headerCell}>STL</Text>
              <Text style={styles.headerCell}>BLK</Text>
              <Text style={styles.headerCell}>TO</Text>
              <Text style={styles.headerCell}>PF</Text>

              {/* Estadísticas avanzadas */}
              <Text style={styles.headerCell}>PIR</Text>
              <Text style={styles.headerCell}>A/T</Text>
            </View>

            {/* Si no hay datos, mostrar mensaje */}
            {playerStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No statistics available</Text>
              </View>
            ) : (
              // Filas de jugadores
              playerStats.map((player) => {
                // Calcular porcentajes
                const fgPct =
                  player.fieldGoalsAttempted > 0
                    ? Math.round(
                        (player.fieldGoalsMade / player.fieldGoalsAttempted) *
                          100
                      )
                    : 0;

                const ftPct =
                  player.freeThrowsAttempted > 0
                    ? Math.round(
                        (player.freeThrowsMade / player.freeThrowsAttempted) *
                          100
                      )
                    : 0;

                const twoPct =
                  player.twoPointsAttempted > 0
                    ? Math.round(
                        (player.twoPointsMade / player.twoPointsAttempted) * 100
                      )
                    : 0;

                const threePct =
                  player.threePointsAttempted > 0
                    ? Math.round(
                        (player.threePointsMade / player.threePointsAttempted) *
                          100
                      )
                    : 0;

                return (
                  <View
                    key={player._id}
                    style={[
                      styles.tableRow,
                      player.isStarter ? styles.starterRow : styles.benchRow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        styles.playerCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.name || "Player"} #{player.number || "0"}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.points || 0}
                    </Text>

                    {/* Tiros de campo */}
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.fieldGoalsMade || 0}/
                      {player.fieldGoalsAttempted || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {fgPct}%
                    </Text>

                    {/* Tiros de 2 puntos */}
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.twoPointsMade || 0}/
                      {player.twoPointsAttempted || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {twoPct}%
                    </Text>

                    {/* Tiros de 3 puntos */}
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.threePointsMade || 0}/
                      {player.threePointsAttempted || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {threePct}%
                    </Text>

                    {/* Tiros libres */}
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.freeThrowsMade || 0}/
                      {player.freeThrowsAttempted || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {ftPct}%
                    </Text>

                    {/* Rebotes */}
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.rebounds || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.defRebounds || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.offRebounds || 0}
                    </Text>

                    {/* Otras estadísticas */}
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.assists || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.steals || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.blocks || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.turnovers || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.fouls || 0}
                    </Text>

                    {/* Estadísticas avanzadas */}
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.pir || 0}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        isSmallScreen && { fontSize: 11 },
                      ]}
                    >
                      {player.assistToTurnoverRatio || 0}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </ScrollView>
    );
  };

  // Verifica si está cargando cualquiera de las consultas
  const isLoading =
    isMatchLoading ||
    isPeriodsLoading ||
    isPlayersLoading ||
    isTeamLoading ||
    isStatsLoading;

  if (isLoading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Verifica si hay error en la consulta principal
  if (isMatchError) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {matchError?.message || "Error loading match data"}
          </Text>
          <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
            <Text style={styles.returnButtonText}>Return home</Text>
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
      {/* Reemplazo del botón de flecha por un botón "Finish" para volver a la pantalla inicial */}
      <TouchableOpacity style={styles.finishButton} onPress={handleGoBack}>
        <Text style={styles.finishButtonText}>Finish</Text>
      </TouchableOpacity>

      {/* Botón para exportar a PDF */}
      <TouchableOpacity
        style={[
          styles.pdfButton,
          isSmallScreen && {
            right: 10,
            paddingVertical: 5,
            paddingHorizontal: 10,
          },
        ]}
        onPress={generatePDF}
        disabled={generatingPDF}
      >
        <Ionicons
          name="document-text-outline"
          size={isSmallScreen ? 20 : 24}
          color="black"
        />
        <Text style={[styles.pdfButtonText, isSmallScreen && { fontSize: 12 }]}>
          {generatingPDF ? "Generating..." : "Export to PDF"}
        </Text>
      </TouchableOpacity>

      <ScreenHeader
        title="Game Summary"
        onBack={handleGoBack}
        showBackButton={false}
        isMainScreen={false}
      />

      {/* Resumen del partido - responsive */}
      <View
        style={[
          styles.matchSummary,
          isSmallScreen && { marginTop: 10, padding: 10 },
        ]}
      >
        <View style={styles.scoreboardRow}>
          {/* Lado izquierdo: Equipo A (Logo + Nombre) */}
          <View style={styles.teamSide}>
            {/* Logo Equipo A */}
            <View style={styles.teamLogoContainer}>
              {team?.team_photo ? (
                <Image
                  source={{ uri: team.team_photo }}
                  style={[
                    styles.teamLogo,
                    isSmallScreen && {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.logoPlaceholder,
                    isSmallScreen && {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.logoPlaceholderText,
                      isSmallScreen && { fontSize: 14 },
                    ]}
                  >
                    {teamName.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {/* Nombre Equipo A */}
            <Text style={[styles.teamName, isSmallScreen && { fontSize: 14 }]}>
              {teamName}
            </Text>
          </View>

          {/* Centro: Puntuación */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              <Text
                style={[styles.teamScore, isSmallScreen && { fontSize: 24 }]}
              >
                {match?.teamAScore || 0}
              </Text>
              <Text
                style={[
                  styles.scoreSeparator,
                  isSmallScreen && { fontSize: 24 },
                ]}
              >
                {" "}
                -{" "}
              </Text>
              <Text
                style={[styles.teamScore, isSmallScreen && { fontSize: 24 }]}
              >
                {match?.teamBScore || 0}
              </Text>
            </Text>
          </View>

          {/* Lado derecho: Equipo B (Nombre + Logo) */}
          <View style={styles.teamSideRight}>
            {/* Nombre Equipo B */}
            <Text style={[styles.teamName, isSmallScreen && { fontSize: 14 }]}>
              {match?.opponentTeam?.name || "Opponent"}
            </Text>
            {/* Logo Equipo B */}
            <View style={styles.teamLogoContainer}>
              {match?.opponentTeam?.photo ? (
                <Image
                  source={{ uri: match.opponentTeam.photo }}
                  style={[
                    styles.teamLogo,
                    isSmallScreen && {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.logoPlaceholder,
                    isSmallScreen && {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.logoPlaceholderText,
                      isSmallScreen && { fontSize: 14 },
                    ]}
                  >
                    {(match?.opponentTeam?.name || "OP")
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Contenido principal - se adapta según el tamaño */}
      {renderResponsiveContent()}

      {/* Indicador de carga durante la generación del PDF */}
      {generatingPDF && (
        <View style={styles.pdfLoading}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.pdfLoadingText}>Generating PDF...</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  finishButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "#28A745",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  finishButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pdfButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pdfButtonText: {
    marginLeft: 5,
    fontWeight: "bold",
  },
  pdfLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  pdfLoadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  matchSummary: {
    padding: 20,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  scoreboardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
  },
  teamSide: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.5,
    justifyContent: "flex-end",
  },
  teamSideRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.5,
    justifyContent: "flex-start",
  },
  teamLogoContainer: {
    marginHorizontal: 10,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E6E0CE",
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    flexShrink: 1,
  },
  scoreContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  teamScore: {
    fontSize: 30,
    fontWeight: "bold",
  },
  scoreSeparator: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#888",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  // Estilos para la tabla de períodos
  periodsTable: {
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  periodsHeader: {
    flexDirection: "row",
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  periodHeaderCell: {
    flex: 1,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  periodRow: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  periodCell: {
    flex: 1,
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  totalCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  // Estilos para la tabla de jugadores destacados
  topPerformersTable: {
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  topPerformersHeader: {
    flexDirection: "row",
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  topHeaderCell: {
    flex: 1,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  topPerformerRow: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topPerformerCategory: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  topPerformerPlayer: {
    flex: 1,
    textAlign: "center",
  },
  topPerformerValue: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  // Estilos para la tabla de estadísticas de jugadores
  statsTable: {
    marginHorizontal: 10,
    marginBottom: 30,
    borderRadius: 8,
    overflow: "hidden",
    width: Platform.OS === "web" ? "100%" : 1500, // Ancho adaptable para web
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontSize: 12, // Tamaño más pequeño para ajustar
    paddingHorizontal: 5,
    minWidth: 50, // Ancho mínimo para las celdas
  },
  playerCell: {
    flex: 2.5,
    textAlign: "left",
    minWidth: 140, // Ancho mayor para la celda del jugador
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  starterRow: {
    backgroundColor: "white",
  },
  benchRow: {
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12, // Tamaño más pequeño para ajustar
    paddingHorizontal: 5,
    minWidth: 50, // Ancho mínimo para las celdas
  },
  emptyState: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "white",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  returnButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  returnButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
