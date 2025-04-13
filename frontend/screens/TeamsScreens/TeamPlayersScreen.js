import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";

export default function TeamPlayersScreen({ route, navigation }) {
    const { teamId } = route.params;
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState(null);

    // Usar el hook de orientación
    const orientation = useOrientation();

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                
                // Cargar información del equipo
                const teamResponse = await fetch(`${API_BASE_URL}/teams/${teamId}`);
                if (!teamResponse.ok) {
                    throw new Error(`Error al cargar el equipo: ${teamResponse.status}`);
                }
                const teamData = await teamResponse.json();
                setTeam(teamData);
                
                // Cargar jugadores del equipo
                const playersResponse = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
                if (!playersResponse.ok) {
                    throw new Error(`Error al cargar los jugadores: ${playersResponse.status}`);
                }
                const playersData = await playersResponse.json();
                setPlayers(playersData);
                
            } catch (error) {
                console.error("Error al cargar datos:", error);
                Alert.alert("Error", "No se pudieron cargar los datos del equipo");
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [teamId]);

    const handleAddPlayer = () => {
        navigation.navigate('CreatePlayer', { teamId });
    };

    const renderPlayerItem = ({ item }) => (
        <View style={styles.playerCard}>
            <View style={styles.playerNumber}>
                <Text style={styles.numberText}>#{item.number || '0'}</Text>
            </View>
            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerPosition}>{item.position || 'No position'}</Text>
                <Text style={styles.playerDetails}>
                    Height: {item.height || 'N/A'} • Weight: {item.weight || 'N/A'}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFA500" />
                <Text style={styles.loadingText}>Cargando jugadores...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Botón para volver */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
                {team ? `${team.name} Players` : 'Team Players'}
            </Text>
            
            {players.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No players in this team yet</Text>
                    <Text style={styles.emptySubtext}>Add players to start tracking their stats</Text>
                </View>
            ) : (
                <FlatList
                    data={players}
                    renderItem={renderPlayerItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
            
            {/* Botón para añadir jugador */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddPlayer}
            >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.addButtonText}>Add New Player</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF8E1",
        paddingTop: 50,
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
    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 30,
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 90, // Espacio para el botón de añadir
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
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    numberText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    playerPosition: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    playerDetails: {
        fontSize: 14,
        color: '#888',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#FFA500',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
    }
});