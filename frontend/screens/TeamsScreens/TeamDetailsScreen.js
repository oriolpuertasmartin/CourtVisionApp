import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery } from '@tanstack/react-query';

export default function TeamDetailsScreen({ route, navigation }) {
    const { teamId } = route.params;
    
    // Usar el hook de orientación
    const orientation = useOrientation();

    // Consulta para obtener los datos del equipo
    const {
        data: team,
        isLoading: isTeamLoading,
        isError: isTeamError,
        error: teamError,
        refetch: refetchTeam
    } = useQuery({
        queryKey: ['team', teamId],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
            if (!response.ok) {
                throw new Error(`Error al cargar el equipo: ${response.status}`);
            }
            return await response.json();
        },
        enabled: !!teamId
    });

    // Consulta para obtener los jugadores del equipo
    const {
        data: players = [],
        isLoading: isPlayersLoading,
        isError: isPlayersError,
        error: playersError
    } = useQuery({
        queryKey: ['players', 'team', teamId],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
            if (!response.ok) {
                throw new Error(`Error al cargar los jugadores: ${response.status}`);
            }
            return await response.json();
        },
        enabled: !!teamId
    });

    // Consulta para obtener todos los partidos
    const {
        data: allMatches = [],
        isLoading: isMatchesLoading,
        isError: isMatchesError,
        error: matchesError
    } = useQuery({
        queryKey: ['matches'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/matches`);
            if (!response.ok) {
                throw new Error(`Error al cargar los partidos: ${response.status}`);
            }
            return await response.json();
        }
    });

    // Filtrar los partidos del equipo usando useMemo para evitar cálculos innecesarios
    const matches = useMemo(() => {
        if (!allMatches.length || !teamId) return [];
        
        return allMatches
            .filter(match => 
                match.teamId === teamId || 
                (match.opponentTeam && match.opponentTeam._id === teamId)
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allMatches, teamId]);

    // Calcular estadísticas del equipo también con useMemo
    const stats = useMemo(() => {
        const totalMatches = matches.length;
        const completedMatches = matches.filter(match => match.status === 'completed');
        const wins = completedMatches.filter(match => match.teamAScore > match.teamBScore).length;
        const losses = completedMatches.filter(match => match.teamAScore <= match.teamBScore).length;
        const totalPoints = completedMatches.reduce((sum, match) => sum + (match.teamAScore || 0), 0);

        return {
            totalMatches,
            wins,
            losses,
            totalPoints
        };
    }, [matches]);

    // Verificar estado de carga y error
    const isLoading = isTeamLoading || isPlayersLoading || isMatchesLoading;
    const isError = isTeamError || isPlayersError || isMatchesError;
    const errorMessage = teamError?.message || playersError?.message || matchesError?.message;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFA500" />
                <Text style={styles.loadingText}>Cargando información del equipo...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{errorMessage || "Error al cargar datos"}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => refetchTeam()}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Botón para volver */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <ScrollView style={styles.scrollContainer}>
                {/* Cabecera del equipo */}
                <View style={styles.teamHeader}>
                    {team?.team_photo ? (
                        <Image source={{ uri: team.team_photo }} style={styles.teamPhoto} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>{team?.name?.substring(0, 2) || 'T'}</Text>
                        </View>
                    )}
                    <Text style={styles.teamName}>{team?.name || 'Team'}</Text>
                    <Text style={styles.teamCategory}>{team?.category || 'No category'}</Text>
                </View>

                {/* Resumen de estadísticas */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Team Statistics</Text>
                    
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalMatches}</Text>
                            <Text style={styles.statLabel}>Matches</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.wins}</Text>
                            <Text style={styles.statLabel}>Wins</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.losses}</Text>
                            <Text style={styles.statLabel}>Losses</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalPoints}</Text>
                            <Text style={styles.statLabel}>Points</Text>
                        </View>
                    </View>
                </View>

                {/* Lista de jugadores */}
                <View style={styles.playersContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Team Players ({players.length})</Text>
                        
                        <TouchableOpacity 
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('TeamPlayers', { teamId })}
                        >
                            <Text style={styles.viewAllButtonText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {players.length === 0 ? (
                        <Text style={styles.emptyMessage}>No players in this team</Text>
                    ) : (
                        players.slice(0, 3).map(player => (
                            <View key={player._id} style={styles.playerCard}>
                                <View style={styles.playerNumber}>
                                    <Text style={styles.numberText}>#{player.number || '0'}</Text>
                                </View>
                                <View style={styles.playerInfo}>
                                    <Text style={styles.playerName}>{player.name}</Text>
                                    <Text style={styles.playerPosition}>{player.position || 'No position'}</Text>
                                </View>
                            </View>
                        ))
                    )}
                    
                    {players.length > 3 && (
                        <Text style={styles.morePlayersText}>+{players.length - 3} more players...</Text>
                    )}
                </View>

                {/* Últimos partidos */}
                <View style={styles.recentMatchesContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Matches</Text>
                        
                        <TouchableOpacity 
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('TeamMatches', { teamId, userId: team?.user_id })}
                        >
                            <Text style={styles.viewAllButtonText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {matches.length === 0 ? (
                        <Text style={styles.emptyMessage}>No matches played yet</Text>
                    ) : (
                        matches.slice(0, 3).map(match => (
                            <View key={match._id} style={styles.matchCard}>
                                <Text style={styles.matchDate}>
                                    {new Date(match.date).toLocaleDateString()}
                                </Text>
                                <View style={styles.matchScore}>
                                    <Text style={styles.teamText}>{team?.name}</Text>
                                    <Text style={styles.scoreText}>
                                        {match.teamAScore || 0} - {match.teamBScore || 0}
                                    </Text>
                                    <Text style={styles.teamText}>{match.opponentTeam?.name || 'Opponent'}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.viewStatsButton}
                                    onPress={() => navigation.navigate('StatsView', { matchId: match._id })}
                                >
                                    <Text style={styles.viewStatsButtonText}>View Stats</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                    
                    {matches.length > 3 && (
                        <Text style={styles.moreMatchesText}>+{matches.length - 3} more matches...</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF8E1",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FFF8E1",
    },
    loadingText: {
        fontSize: 16,
        marginTop: 10,
        color: "#666",
    },
    errorText: {
        fontSize: 16,
        color: "#D32F2F",
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 30,
    },
    retryButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    scrollContainer: {
        flex: 1,
        paddingTop: 80,
        paddingHorizontal: 20,
    },
    teamHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    teamPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E6E0CE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    photoPlaceholderText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFA500',
    },
    teamName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    teamCategory: {
        fontSize: 18,
        color: '#666',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E6E0CE',
        paddingBottom: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewAllButton: {
        backgroundColor: '#FFA500',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
    },
    viewAllButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    statsContainer: {
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    statItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        width: '48%',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFA500',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    playersContainer: {
        marginBottom: 20,
    },
    playerCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    playerNumber: {
        backgroundColor: '#FFA500',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    numberText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerPosition: {
        fontSize: 14,
        color: '#666',
    },
    morePlayersText: {
        textAlign: 'center',
        padding: 10,
        color: '#888',
        fontStyle: 'italic',
    },
    recentMatchesContainer: {
        marginBottom: 30,
    },
    matchCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    matchDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    matchScore: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    teamText: {
        fontSize: 14,
        fontWeight: 'bold',
        width: '40%',
    },
    scoreText: {
        fontSize: 20,
        fontWeight: 'bold',
        width: '20%',
        textAlign: 'center',
    },
    viewStatsButton: {
        backgroundColor: '#FFA500',
        borderRadius: 5,
        paddingVertical: 8,
        alignItems: 'center',
    },
    viewStatsButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    moreMatchesText: {
        textAlign: 'center',
        padding: 10,
        color: '#888',
        fontStyle: 'italic',
    },
    emptyMessage: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontStyle: 'italic',
        backgroundColor: 'white',
        borderRadius: 10,
    }
});