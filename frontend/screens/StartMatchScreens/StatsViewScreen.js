import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API_BASE_URL from "../../config/apiConfig";
import { useQuery } from '@tanstack/react-query';

export default function StatsView({ route, navigation }) {
  const { matchId } = route.params;
  const [teamName, setTeamName] = useState('Mi Equipo');
  const [topPerformers, setTopPerformers] = useState({
    points: { player: null, value: 0 },
    rebounds: { player: null, value: 0 },
    assists: { player: null, value: 0 },
    steals: { player: null, value: 0 },
    blocks: { player: null, value: 0 }
  });
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Consulta para obtener datos del partido
  const {
    data: match,
    isLoading: isMatchLoading,
    isError: isMatchError,
    error: matchError
  } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar el partido: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!matchId
  });

  // Consulta para obtener el historial de períodos
  const {
    data: periodsHistory = [],
    isLoading: isPeriodsLoading
  } = useQuery({
    queryKey: ['periods', matchId],
    queryFn: async () => {
      // Usamos los datos del partido si ya están disponibles
      if (match?.periodsHistory) {
        return match.periodsHistory;
      }
      
      // O hacemos una petición específica si es necesario
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/periods`);
      if (!response.ok) {
        throw new Error(`Error al cargar los períodos: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!matchId,
    initialData: []
  });

  // Consulta para obtener jugadores del equipo
  const {
    data: allPlayers = [],
    isLoading: isPlayersLoading
  } = useQuery({
    queryKey: ['allplayers', match?.teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/players/team/${match.teamId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar jugadores: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!match?.teamId
  });

  // Consulta para obtener el equipo
  const {
    data: team,
    isLoading: isTeamLoading
  } = useQuery({
    queryKey: ['team', match?.teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/teams/${match.teamId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar el equipo: ${response.status}`);
      }
      
      const teamData = await response.json();
      // Actualizamos el nombre del equipo
      setTeamName(teamData.name || 'Mi Equipo');
      return teamData;
    },
    enabled: !!match?.teamId
  });

  // Consulta para obtener las estadísticas de los jugadores
  const {
    data: allStatsData = [],
    isLoading: isStatsLoading
  } = useQuery({
    queryKey: ['playerstats', 'match', matchId, allPlayers?.map(p => p._id)?.join(',')],
    queryFn: async () => {
      if (!allPlayers || allPlayers.length === 0) return [];
      
      const allPlayerIds = allPlayers.map(player => player._id);
      
      const response = await fetch(
        `${API_BASE_URL}/playerstats?matchId=${matchId}&playerIds=${allPlayerIds.join(',')}`
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar estadísticas: ${response.status}`);
      }
      
      return await response.json();
    },
    enabled: !!matchId && allPlayers.length > 0,
    onSuccess: (data) => {
      processPlayerStats(data);
    }
  });

  // Función para procesar los datos de estadísticas y jugadores
  const processPlayerStats = (statsData) => {
    if (!statsData || !allPlayers) return;
    
    // Combinar estadísticas con información de jugadores
    const top = {
      points: { player: null, value: 0 },
      rebounds: { player: null, value: 0 },
      assists: { player: null, value: 0 },
      steals: { player: null, value: 0 },
      blocks: { player: null, value: 0 }
    };
    
    statsData.forEach(player => {
      // Máximo anotador
      if ((player.points || 0) > top.points.value) {
        const playerInfo = allPlayers.find(p => p._id === player.playerId);
        if (playerInfo) {
          top.points = { 
            player: `${playerInfo.name} #${playerInfo.number}`, 
            value: player.points || 0 
          };
        }
      }
      
      // Máximo reboteador
      if ((player.rebounds || 0) > top.rebounds.value) {
        const playerInfo = allPlayers.find(p => p._id === player.playerId);
        if (playerInfo) {
          top.rebounds = { 
            player: `${playerInfo.name} #${playerInfo.number}`, 
            value: player.rebounds || 0 
          };
        }
      }
      
      // Máximo asistente
      if ((player.assists || 0) > top.assists.value) {
        const playerInfo = allPlayers.find(p => p._id === player.playerId);
        if (playerInfo) {
          top.assists = { 
            player: `${playerInfo.name} #${playerInfo.number}`, 
            value: player.assists || 0 
          };
        }
      }
      
      // Máximo en robos
      if ((player.steals || 0) > top.steals.value) {
        const playerInfo = allPlayers.find(p => p._id === player.playerId);
        if (playerInfo) {
          top.steals = { 
            player: `${playerInfo.name} #${playerInfo.number}`, 
            value: player.steals || 0 
          };
        }
      }
      
      // Máximo en tapones
      if ((player.blocks || 0) > top.blocks.value) {
        const playerInfo = allPlayers.find(p => p._id === player.playerId);
        if (playerInfo) {
          top.blocks = { 
            player: `${playerInfo.name} #${playerInfo.number}`, 
            value: player.blocks || 0 
          };
        }
      }
    });
    
    setTopPerformers(top);
  };

  // Procesamiento de los datos de los jugadores para la tabla
  const playerStats = React.useMemo(() => {
    if (!allStatsData.length || !allPlayers.length || !match) return [];
    
    // Combinar estadísticas con información de jugadores
    const combinedData = allStatsData.map(stat => ({
      ...stat,
      ...allPlayers.find(p => p._id === stat.playerId),
      isStarter: match.startingPlayers?.includes(stat.playerId)
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
    navigation.navigate('Main', { screen: 'Home' });
  };

  // Función para generar y exportar a PDF
  const generatePDF = async () => {
    // Verificar la plataforma
    if (Platform.OS === 'web') {
      generatePDFForWeb();
    } else {
      generatePDFForMobile();
    }
  };

  // Función específica para generar PDF en navegadores web
  const generatePDFForWeb = () => {
    try {
      setGeneratingPDF(true);
      
      const matchDate = match?.date ? new Date(match.date).toLocaleDateString() : 'Sin fecha';
      const fileName = `Estadisticas_${teamName.replace(/ /g, '_')}_vs_${(match?.opponentTeam?.name || 'Oponente').replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}`;
      
      // HTML para el documento
      const htmlContent = generateHTMLContent(matchDate);
      
      // Crear un iframe oculto para poder imprimir/guardar como PDF
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.top = '-1000px';
      printIframe.style.left = '-1000px';
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
            console.error('Error al imprimir:', error);
            setGeneratingPDF(false);
            Alert.alert('Error', 'No se pudo generar el PDF: ' + error.message);
          }
        }, 500);
      };
    } catch (error) {
      console.error('Error al generar PDF en la web:', error);
      setGeneratingPDF(false);
      Alert.alert('Error', 'No se pudo generar el PDF: ' + error.message);
    }
  };

  // Función específica para generar PDF en dispositivos móviles
  const generatePDFForMobile = async () => {
    try {
      setGeneratingPDF(true);
      
      // Importaciones dinámicas para dispositivos móviles
      const RNHTMLtoPDF = require('react-native-html-to-pdf').default;
      const Sharing = require('expo-sharing');
      
      // Fecha del partido formateada
      const matchDate = match?.date ? new Date(match.date).toLocaleDateString() : 'Sin fecha';
      
      // Generar HTML para el PDF
      const htmlContent = generateHTMLContent(matchDate);

      // Crear nombre de archivo basado en los equipos y la fecha
      const fileName = `Estadisticas_${teamName.replace(/ /g, '_')}_vs_${(match?.opponentTeam?.name || 'Oponente').replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}`;
      
      // Opciones para generar el PDF
      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents',
        base64: false
      };

      // Generar el PDF
      const file = await RNHTMLtoPDF.convert(options);
      
      // Compartir el archivo PDF
      if (file && file.filePath) {
        console.log('PDF generado:', file.filePath);
        
        if (Platform.OS === 'ios') {
          // En iOS, usamos la API de compartir
          await Sharing.shareAsync(file.filePath);
        } else {
          // En Android, mostramos la ruta y un mensaje
          Alert.alert(
            "PDF Generado",
            `PDF guardado en: ${file.filePath}`,
            [{ text: "OK" }]
          );
        }
      }

    } catch (error) {
      console.error('Error al generar PDF en móvil:', error);
      Alert.alert('Error', 'No se pudo generar el PDF: ' + error.message);
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
        <title>Estadísticas de Partido</title>
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
          <div class="title">Resumen del Partido</div>
          <div class="subtitle">${matchDate}</div>
          <div class="subtitle">${teamName} vs ${match?.opponentTeam?.name || 'Oponente'}</div>
          <div class="score">${match?.teamAScore || 0} - ${match?.teamBScore || 0}</div>
        </div>

        <h2>Puntos por Períodos</h2>
        <table>
          <tr>
            <th>Período</th>
            <th>${teamName}</th>
            <th>${match?.opponentTeam?.name || 'Oponente'}</th>
          </tr>
          ${periodsHistory.map(period => `
            <tr>
              <td>${period.period}</td>
              <td>${period.teamAScore}</td>
              <td>${period.teamBScore}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${match?.teamAScore || 0}</td>
            <td>${match?.teamBScore || 0}</td>
          </tr>
        </table>

        <h2>Jugadores Destacados</h2>
        <table>
          <tr>
            <th>Categoría</th>
            <th>Jugador</th>
            <th>Valor</th>
          </tr>
          <tr>
            <td>Puntos</td>
            <td>${topPerformers.points.player || 'N/A'}</td>
            <td>${topPerformers.points.value || 0}</td>
          </tr>
          <tr>
            <td>Rebotes</td>
            <td>${topPerformers.rebounds.player || 'N/A'}</td>
            <td>${topPerformers.rebounds.value || 0}</td>
          </tr>
          <tr>
            <td>Asistencias</td>
            <td>${topPerformers.assists.player || 'N/A'}</td>
            <td>${topPerformers.assists.value || 0}</td>
          </tr>
          <tr>
            <td>Robos</td>
            <td>${topPerformers.steals.player || 'N/A'}</td>
            <td>${topPerformers.steals.value || 0}</td>
          </tr>
          <tr>
            <td>Tapones</td>
            <td>${topPerformers.blocks.player || 'N/A'}</td>
            <td>${topPerformers.blocks.value || 0}</td>
          </tr>
        </table>

        <h2>Estadísticas Globales</h2>
        <table>
          <tr>
            <th>Jugador</th>
            <th>PTS</th>
            <th>TC</th>
            <th>%TC</th>
            <th>2P</th>
            <th>%2P</th>
            <th>3P</th>
            <th>%3P</th>
            <th>TL</th>
            <th>%TL</th>
            <th>REB</th>
            <th>DREB</th>
            <th>OREB</th>
            <th>AST</th>
            <th>ROB</th>
            <th>TAP</th>
            <th>PER</th>
            <th>FLT</th>
            <th>PIR</th>
            <th>A/P</th>
          </tr>
          ${playerStats.map(player => {
            // Calcular porcentajes
            const fgPct = player.fieldGoalsAttempted > 0 
              ? Math.round((player.fieldGoalsMade / player.fieldGoalsAttempted) * 100) 
              : 0;
            
            const ftPct = player.freeThrowsAttempted > 0 
              ? Math.round((player.freeThrowsMade / player.freeThrowsAttempted) * 100)
              : 0;
            
            const twoPct = player.twoPointsAttempted > 0
              ? Math.round((player.twoPointsMade / player.twoPointsAttempted) * 100)
              : 0;
              
            const threePct = player.threePointsAttempted > 0
              ? Math.round((player.threePointsMade / player.threePointsAttempted) * 100)
              : 0;
            
            return `
              <tr class="${player.isStarter ? 'starter-row' : 'bench-row'}">
                <td class="player-name">${player.name || 'Jugador'} #${player.number || '0'}</td>
                <td>${player.points || 0}</td>
                <td>${player.fieldGoalsMade || 0}/${player.fieldGoalsAttempted || 0}</td>
                <td>${fgPct}%</td>
                <td>${player.twoPointsMade || 0}/${player.twoPointsAttempted || 0}</td>
                <td>${twoPct}%</td>
                <td>${player.threePointsMade || 0}/${player.threePointsAttempted || 0}</td>
                <td>${threePct}%</td>
                <td>${player.freeThrowsMade || 0}/${player.freeThrowsAttempted || 0}</td>
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
          }).join('')}
        </table>

        <div class="footer">
          Generado por CourtVisionApp - ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
  };

  // Verifica si está cargando cualquiera de las consultas
  const isLoading = isMatchLoading || isPeriodsLoading || isPlayersLoading || 
                   isTeamLoading || isStatsLoading;
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  // Verifica si hay error en la consulta principal
  if (isMatchError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{matchError?.message || "Error al cargar datos del partido"}</Text>
        <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
          <Text style={styles.returnButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Botón para exportar a PDF */}
      <TouchableOpacity 
        style={styles.pdfButton} 
        onPress={generatePDF}
        disabled={generatingPDF}
      >
        <Ionicons name="document-text-outline" size={24} color="black" />
        <Text style={styles.pdfButtonText}>
          {generatingPDF ? "Generando..." : "Exportar a PDF"}
        </Text>
      </TouchableOpacity>
      
      {/* Resumen del partido */}
      <View style={styles.matchSummary}>
        <View style={styles.scoreboardRow}>
          {/* Lado izquierdo: Equipo A (Logo + Nombre) */}
          <View style={styles.teamSide}>
            {/* Logo Equipo A */}
            <View style={styles.teamLogoContainer}>
              {team?.team_photo ? (
                <Image source={{ uri: team.team_photo }} style={styles.teamLogo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>
                    {teamName.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {/* Nombre Equipo A */}
            <Text style={styles.teamName}>{teamName}</Text>
          </View>
          
          {/* Centro: Puntuación */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              <Text style={styles.teamScore}>{match?.teamAScore || 0}</Text>
              <Text style={styles.scoreSeparator}> - </Text>
              <Text style={styles.teamScore}>{match?.teamBScore || 0}</Text>
            </Text>
          </View>
          
          {/* Lado derecho: Equipo B (Nombre + Logo) */}
          <View style={styles.teamSideRight}>
            {/* Nombre Equipo B */}
            <Text style={styles.teamName}>{match?.opponentTeam?.name || 'Oponente'}</Text>
            {/* Logo Equipo B */}
            <View style={styles.teamLogoContainer}>
              {match?.opponentTeam?.photo ? (
                <Image source={{ uri: match.opponentTeam.photo }} style={styles.teamLogo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>
                    {(match?.opponentTeam?.name || 'OP').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      
      <ScrollView>
        {/* Tabla de puntos por períodos */}
        <Text style={styles.sectionTitle}>Puntos por Períodos</Text>
        
        <View style={styles.periodsTable}>
          <View style={styles.periodsHeader}>
            <Text style={styles.periodHeaderCell}>Período</Text>
            <Text style={styles.periodHeaderCell}>{teamName}</Text>
            <Text style={styles.periodHeaderCell}>{match?.opponentTeam?.name || 'Oponente'}</Text>
          </View>
          
          {periodsHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay datos de períodos disponibles</Text>
            </View>
          ) : (
            <>
              {/* Filas con datos de cada período */}
              {periodsHistory.map((period, index) => (
                <View key={index} style={styles.periodRow}>
                  <Text style={styles.periodCell}>{period.period}</Text>
                  <Text style={styles.periodCell}>{period.teamAScore}</Text>
                  <Text style={styles.periodCell}>{period.teamBScore}</Text>
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
        <Text style={styles.sectionTitle}>Jugadores Destacados</Text>
        
        <View style={styles.topPerformersTable}>
          <View style={styles.topPerformersHeader}>
            <Text style={styles.topHeaderCell}>Categoría</Text>
            <Text style={styles.topHeaderCell}>Jugador</Text>
            <Text style={styles.topHeaderCell}>Valor</Text>
          </View>
          
          {/* Fila para máximo anotador */}
          <View style={styles.topPerformerRow}>
            <Text style={styles.topPerformerCategory}>Puntos</Text>
            <Text style={styles.topPerformerPlayer}>{topPerformers.points.player || 'N/A'}</Text>
            <Text style={styles.topPerformerValue}>{topPerformers.points.value || 0}</Text>
          </View>
          
          {/* Fila para máximo reboteador */}
          <View style={styles.topPerformerRow}>
            <Text style={styles.topPerformerCategory}>Rebotes</Text>
            <Text style={styles.topPerformerPlayer}>{topPerformers.rebounds.player || 'N/A'}</Text>
            <Text style={styles.topPerformerValue}>{topPerformers.rebounds.value || 0}</Text>
          </View>
          
          {/* Fila para máximo asistente */}
          <View style={styles.topPerformerRow}>
            <Text style={styles.topPerformerCategory}>Asistencias</Text>
            <Text style={styles.topPerformerPlayer}>{topPerformers.assists.player || 'N/A'}</Text>
            <Text style={styles.topPerformerValue}>{topPerformers.assists.value || 0}</Text>
          </View>
          
          {/* Fila para máximo en robos */}
          <View style={styles.topPerformerRow}>
            <Text style={styles.topPerformerCategory}>Robos</Text>
            <Text style={styles.topPerformerPlayer}>{topPerformers.steals.player || 'N/A'}</Text>
            <Text style={styles.topPerformerValue}>{topPerformers.steals.value || 0}</Text>
          </View>
          
          {/* Fila para máximo en tapones */}
          <View style={styles.topPerformerRow}>
            <Text style={styles.topPerformerCategory}>Tapones</Text>
            <Text style={styles.topPerformerPlayer}>{topPerformers.blocks.player || 'N/A'}</Text>
            <Text style={styles.topPerformerValue}>{topPerformers.blocks.value || 0}</Text>
          </View>
        </View>
        
        {/* Tabla de estadísticas globales */}
        <Text style={styles.sectionTitle}>Estadísticas globales</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.statsTable}>
            {/* Encabezados de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.playerCell]}>Jugador</Text>
              <Text style={styles.headerCell}>PTS</Text>
              
              {/* Tiros divididos por tipo */}
              <Text style={styles.headerCell}>TC</Text>
              <Text style={styles.headerCell}>%TC</Text>
              <Text style={styles.headerCell}>2P</Text>
              <Text style={styles.headerCell}>%2P</Text>
              <Text style={styles.headerCell}>3P</Text>
              <Text style={styles.headerCell}>%3P</Text>
              <Text style={styles.headerCell}>TL</Text>
              <Text style={styles.headerCell}>%TL</Text>
              
              {/* Rebotes */}
              <Text style={styles.headerCell}>REB</Text>
              <Text style={styles.headerCell}>DREB</Text>
              <Text style={styles.headerCell}>OREB</Text>
              
              {/* Otras estadísticas */}
              <Text style={styles.headerCell}>AST</Text>
              <Text style={styles.headerCell}>ROB</Text>
              <Text style={styles.headerCell}>TAP</Text>
              <Text style={styles.headerCell}>PER</Text>
              <Text style={styles.headerCell}>FLT</Text>
              
              {/* Estadísticas avanzadas */}
              <Text style={styles.headerCell}>PIR</Text>
              <Text style={styles.headerCell}>A/P</Text>
            </View>
            
            {/* Si no hay datos, mostrar mensaje */}
            {playerStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No hay estadísticas disponibles</Text>
              </View>
            ) : (
              // Filas de jugadores
              playerStats.map(player => {
                // Calcular porcentajes
                const fgPct = player.fieldGoalsAttempted > 0 
                  ? Math.round((player.fieldGoalsMade / player.fieldGoalsAttempted) * 100) 
                  : 0;
                
                const ftPct = player.freeThrowsAttempted > 0 
                  ? Math.round((player.freeThrowsMade / player.freeThrowsAttempted) * 100)
                  : 0;
                
                const twoPct = player.twoPointsAttempted > 0
                  ? Math.round((player.twoPointsMade / player.twoPointsAttempted) * 100)
                  : 0;
                  
                const threePct = player.threePointsAttempted > 0
                  ? Math.round((player.threePointsMade / player.threePointsAttempted) * 100)
                  : 0;
                  
                return (
                  <View key={player._id} style={[
                    styles.tableRow,
                    player.isStarter ? styles.starterRow : styles.benchRow
                  ]}>
                    <Text style={[styles.tableCell, styles.playerCell]}>
                      {player.name || 'Jugador'} #{player.number || '0'}
                    </Text>
                    <Text style={styles.tableCell}>{player.points || 0}</Text>
                    
                    {/* Tiros de campo */}
                    <Text style={styles.tableCell}>
                      {player.fieldGoalsMade || 0}/{player.fieldGoalsAttempted || 0}
                    </Text>
                    <Text style={styles.tableCell}>{fgPct}%</Text>
                    
                    {/* Tiros de 2 puntos */}
                    <Text style={styles.tableCell}>
                      {player.twoPointsMade || 0}/{player.twoPointsAttempted || 0}
                    </Text>
                    <Text style={styles.tableCell}>{twoPct}%</Text>
                    
                    {/* Tiros de 3 puntos */}
                    <Text style={styles.tableCell}>
                      {player.threePointsMade || 0}/{player.threePointsAttempted || 0}
                    </Text>
                    <Text style={styles.tableCell}>{threePct}%</Text>
                    
                    {/* Tiros libres */}
                    <Text style={styles.tableCell}>
                      {player.freeThrowsMade || 0}/{player.freeThrowsAttempted || 0}
                    </Text>
                    <Text style={styles.tableCell}>{ftPct}%</Text>
                    
                    {/* Rebotes */}
                    <Text style={styles.tableCell}>{player.rebounds || 0}</Text>
                    <Text style={styles.tableCell}>{player.defRebounds || 0}</Text>
                    <Text style={styles.tableCell}>{player.offRebounds || 0}</Text>
                    
                    {/* Otras estadísticas */}
                    <Text style={styles.tableCell}>{player.assists || 0}</Text>
                    <Text style={styles.tableCell}>{player.steals || 0}</Text>
                    <Text style={styles.tableCell}>{player.blocks || 0}</Text>
                    <Text style={styles.tableCell}>{player.turnovers || 0}</Text>
                    <Text style={styles.tableCell}>{player.fouls || 0}</Text>
                    
                    {/* Estadísticas avanzadas */}
                    <Text style={styles.tableCell}>{player.pir || 0}</Text>
                    <Text style={styles.tableCell}>{player.assistToTurnoverRatio || 0}</Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </ScrollView>
      
      {/* Indicador de carga durante la generación del PDF */}
      {generatingPDF && (
        <View style={styles.pdfLoading}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.pdfLoadingText}>Generando PDF...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  pdfButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfButtonText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  pdfLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  pdfLoadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    backgroundColor: '#FFA500',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  returnButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  returnButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchSummary: {
    padding: 20,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  scoreboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  teamSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    justifyContent: 'flex-end',
  },
  teamSideRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    justifyContent: 'flex-start',
  },
  teamLogoContainer: {
    marginHorizontal: 10,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E6E0CE',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  teamScore: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  scoreSeparator: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#888',
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  opponentText: {
    fontSize: 18,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  // Estilos para la tabla de períodos
  periodsTable: {
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodsHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  periodHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  periodCell: {
    flex: 1,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  totalCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Estilos para la tabla de jugadores destacados
  topPerformersTable: {
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  topPerformersHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  topHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  topPerformerRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topPerformerCategory: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topPerformerPlayer: {
    flex: 1,
    textAlign: 'center',
  },
  topPerformerValue: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Estilos para la tabla de estadísticas de jugadores
  statsTable: {
    marginHorizontal: 10,
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
    width: Platform.OS === 'web' ? '100%' : 1500, // Ancho adaptable para web
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontSize: 12, // Tamaño más pequeño para ajustar
    paddingHorizontal: 5,
    minWidth: 50, // Ancho mínimo para las celdas
  },
  playerCell: {
    flex: 2.5,
    textAlign: 'left',
    minWidth: 140, // Ancho mayor para la celda del jugador
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  starterRow: {
    backgroundColor: 'white',
  },
  benchRow: {
    backgroundColor: '#f9f9f9',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12, // Tamaño más pequeño para ajustar
    paddingHorizontal: 5,
    minWidth: 50, // Ancho mínimo para las celdas
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});