import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";

export default function TeamMatchesScreen({ route, navigation }) {
    const { teamId, userId } = route.params;
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                
                // Cargar información del equipo
                const teamResponse = await fetch(`http://localhost:3001/teams/${teamId}`);
                if (!teamResponse.ok) {
                    throw new Error(`Error al cargar el equipo: ${teamResponse.status}`);
                }
                const teamData = await teamResponse.json();
                setTeam(teamData);
                
                // En lugar de buscar con ?teamId=X, obtenemos todos los partidos y filtramos
                const matchesResponse = await fetch(`http://localhost:3001/matches`);
                if (!matchesResponse.ok) {
                    throw new Error(`Error al cargar los partidos: ${matchesResponse.status}`);
                }
                
                const allMatches = await matchesResponse.json();
                
                // Filtrar los partidos que pertenecen a este equipo
                const teamMatches = allMatches.filter(match => 
                    match.teamId === teamId || 
                    (match.opponentTeam && match.opponentTeam._id === teamId)
                );
                
                // Formatear los partidos para el BoxSelector
                const formattedMatches = teamMatches.map(match => {
                    const matchDate = new Date(match.date).toLocaleDateString();
                    const status = match.status === 'completed' ? 'Final' : 'En progreso';
                    
                    return {
                        _id: match._id,
                        name: `${team?.name || 'Team'} vs ${match.opponentTeam?.name || 'Opponent'}`,
                        subtitle: `${match.teamAScore || 0} - ${match.teamBScore || 0} • ${status} • ${matchDate}`,
                        match: match // Guardar el objeto completo para usarlo después
                    };
                });
                
                setMatches(formattedMatches);
            } catch (error) {
                console.error("Error al cargar datos:", error);
                Alert.alert("Error", "No se pudieron cargar los partidos del equipo");
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [teamId, userId]);

    const handleSelectMatch = (match) => {
        navigation.navigate('StatsView', { matchId: match._id });
    };

    return (
        <View style={styles.container}>
            {/* Botón para volver */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
                {team ? `${team.name} Matches` : 'Team Matches'}
            </Text>
            
            {loading ? (
                <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
            ) : (
                <View style={styles.boxSelectorContainer}>
                    <BoxSelector
                        items={matches}
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
        backgroundColor: "#FFF8E1",
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
        width: '90%',
        flex: 1,
    },
    loader: {
        marginTop: 50,
    }
});