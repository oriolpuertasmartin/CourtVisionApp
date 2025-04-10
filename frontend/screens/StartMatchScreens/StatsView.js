import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatsView({ route, navigation }) {
  const { matchId } = route.params;
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState([]);
  const [teamName, setTeamName] = useState('Mi Equipo');
  const [match, setMatch] = useState(null);
  const [periodsHistory, setPeriodsHistory] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching match data for matchId:', matchId);
        
        // 1. Obtener datos del partido
        const matchResponse = await fetch(`http://localhost:3001/matches/${matchId}`);
        if (!matchResponse.ok) {
          console.error('Error fetching match data:', matchResponse.status);
          throw new Error('Error al cargar datos del partido');
        }
        
        const matchData = await matchResponse.json();
        console.log('Match data retrieved:', matchData);
        setMatch(matchData);
        
        // Obtener historial de períodos si existe
        if (matchData.periodsHistory && matchData.periodsHistory.length > 0) {
          setPeriodsHistory(matchData.periodsHistory);
          console.log('Periods history retrieved:', matchData.periodsHistory);
        }
        
        // 2. Obtener estadísticas de los jugadores titulares
        if (matchData.startingPlayers && matchData.startingPlayers.length > 0) {
          const playerIdsParam = matchData.startingPlayers.join(',');
          console.log('Fetching stats for players:', playerIdsParam);
          
          const statsResponse = await fetch(
            `http://localhost:3001/playerstats?matchId=${matchId}&playerIds=${playerIdsParam}`
          );
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('Player stats retrieved:', statsData);
            
            // 3. Obtener información de los jugadores
            const playersResponse = await fetch(
              `http://localhost:3001/players?ids=${playerIdsParam}`
            );
            
            if (playersResponse.ok) {
              const playersData = await playersResponse.json();
              console.log('Player details retrieved:', playersData);
              
              // Combinar estadísticas con información de jugadores
              const combinedData = statsData.map(stat => ({
                ...stat,
                ...playersData.find(p => p._id === stat.playerId)
              }));
              
              setPlayerStats(combinedData);
            }
          }
        }
        
        // 4. Obtener nombre del equipo
        if (matchData.teamId) {
          try {
            const teamResponse = await fetch(`http://localhost:3001/teams/${matchData.teamId}`);
            if (teamResponse.ok) {
              const teamData = await teamResponse.json();
              if (teamData.name) {
                setTeamName(teamData.name);
              }
            }
          } catch (error) {
            console.error('Error fetching team name:', error);
            // Continuamos incluso si no podemos obtener el nombre del equipo
          }
        }
        
      } catch (error) {
        console.error('Error fetching match data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [matchId]);
  
  // Simple función para volver a la pantalla principal
  const handleGoBack = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Resumen del partido */}
      <View style={styles.matchSummary}>
        <Text style={styles.teamTitle}>{teamName}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {match?.teamAScore || 0} - {match?.teamBScore || 0}
          </Text>
          <Text style={styles.opponentText}>{match?.opponentTeam?.name || 'Oponente'}</Text>
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
        
        {/* Tabla de estadísticas */}
        <Text style={styles.sectionTitle}>Estadísticas de Jugadores</Text>
        
        <View style={styles.statsTable}>
          {/* Encabezados de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.playerCell]}>Jugador</Text>
            <Text style={styles.headerCell}>PTS</Text>
            <Text style={styles.headerCell}>REB</Text>
            <Text style={styles.headerCell}>AST</Text>
            <Text style={styles.headerCell}>ROB</Text>
            <Text style={styles.headerCell}>TAP</Text>
          </View>
          
          {/* Si no hay datos, mostrar mensaje */}
          {playerStats.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay estadísticas disponibles</Text>
            </View>
          ) : (
            // Filas de jugadores
            playerStats.map(player => (
              <View key={player._id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.playerCell]}>
                  {player.name || 'Jugador'} #{player.number || '0'}
                </Text>
                <Text style={styles.tableCell}>{player.points || 0}</Text>
                <Text style={styles.tableCell}>{player.rebounds || 0}</Text>
                <Text style={styles.tableCell}>{player.assists || 0}</Text>
                <Text style={styles.tableCell}>{player.steals || 0}</Text>
                <Text style={styles.tableCell}>{player.blocks || 0}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  matchSummary: {
    padding: 20,
    alignItems: 'center',
    marginTop: 30,
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
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
  // Estilos para la tabla de estadísticas de jugadores
  statsTable: {
    marginHorizontal: 10,
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  playerCell: {
    flex: 2.5,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
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