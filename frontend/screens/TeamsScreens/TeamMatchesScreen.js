import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery } from "@tanstack/react-query";

export default function TeamMatchesScreen({ route, navigation }) {
    const { teamId, userId } = route.params;
    
    // Usar el hook de orientación
    const orientation = useOrientation();

    // Consulta para obtener información del equipo
    const {
        data: team,
        isLoading: isTeamLoading,
        isError: isTeamError,
        error: teamError
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
    
    // Consulta para obtener todos los partidos
    const {
        data: allMatches = [],
        isLoading: isMatchesLoading,
        isError: isMatchesError,
        error: matchesError,
        refetch: refetchMatches
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
    
    // Filtrar y formatear partidos
    const formattedMatches = React.useMemo(() => {
        if (!allMatches.length || !team) return [];
        
        // Filtrar los partidos que pertenecen a este equipo
        const teamMatches = allMatches
            .filter(match => 
                match.teamId === teamId || 
                (match.opponentTeam && match.opponentTeam._id === teamId)
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar por fecha descendente
        
        // Formatear los partidos para el BoxSelector
        return teamMatches.map(match => {
            const matchDate = new Date(match.date).toLocaleDateString();
            const status = match.status === 'completed' ? 'Final' : 'En progreso';
            
            return {
                _id: match._id,
                name: `${team?.name || 'Team'} vs ${match.opponentTeam?.name || 'Opponent'}`,
                subtitle: `${match.teamAScore || 0} - ${match.teamBScore || 0} • ${status} • ${matchDate}`,
                match: match // Guardar el objeto completo para usarlo después
            };
        });
    }, [allMatches, team, teamId]);

    const handleSelectMatch = (match) => {
        navigation.navigate('StatsView', { matchId: match._id });
    };
    
    // Determinar estado de carga y error general
    const isLoading = isTeamLoading || isMatchesLoading;
    const isError = isTeamError || isMatchesError;
    const errorMessage = teamError?.message || matchesError?.message;

    return (
        <View style={styles.container}>
            {/* Botón para volver */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
                {team ? `${team.name} Matches` : 'Team Matches'}
            </Text>
            
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFA500" />
                    <Text style={styles.loadingText}>Cargando partidos...</Text>
                </View>
            ) : isError ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage || "Error al cargar los partidos"}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => refetchMatches()}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.boxSelectorContainer}>
                    <BoxSelector
                        items={formattedMatches}
                        onSelect={handleSelectMatch}
                        emptyMessage="No matches found for this team"
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: 50,
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 30,
        marginBottom: 20,
    },
    boxSelectorContainer: {
        width: '100%',
        flex: 1,
        paddingHorizontal: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        marginTop: 15,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#D32F2F",
        textAlign: 'center',
        marginBottom: 20,
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
    }
});