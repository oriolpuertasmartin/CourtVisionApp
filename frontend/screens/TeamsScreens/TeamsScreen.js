import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from "react-native";
import BoxSelector from "../../components/BoxSelector";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";

export default function TeamsScreen({ navigation, route }) {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(route.params?.user || null);

    // Usar el hook de orientación
    const orientation = useOrientation();

    // Efecto combinado para manejar el usuario y cargar equipos
    useEffect(() => {
        // Actualizar usuario si cambia en route.params
        if (route.params?.user) {
            setUser(route.params.user);
        }
        
        // Intentar cargar equipos si tenemos usuario
        async function loadTeams() {
            if (!user || !user._id) {
                console.log("No hay usuario disponible para cargar equipos");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                console.log("Cargando equipos para usuario:", user._id);
                
                const response = await fetch(`${API_BASE_URL}/teams/user/${user._id}`);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log("Equipos cargados correctamente:", data.length);
                setTeams(data);
            } catch (error) {
                console.error("Error al cargar equipos:", error);
                setError("No se pudieron cargar los equipos. Por favor, intenta de nuevo.");
                Alert.alert(
                    "Error", 
                    "No se pudieron cargar los equipos. ¿Quieres intentar de nuevo?",
                    [
                        {
                            text: "Cancelar",
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => loadTeams()
                        }
                    ]
                );
            } finally {
                setLoading(false);
            }
        }
        
        loadTeams();
    }, [route.params?.user]);

    const handleViewTeamDetails = (teamId) => {
        // Navegar a la pantalla de resumen del equipo
        navigation.navigate('TeamDetails', { teamId });
    };

    const handleViewTeamMatches = (teamId) => {
        // Navegar a la pantalla de partidos del equipo
        navigation.navigate('TeamMatches', { teamId, userId: user?._id });
    };

    const handleViewTeamPlayers = (teamId) => {
        // Navegar a los detalles del equipo seleccionado
        navigation.navigate('TeamPlayers', { teamId });
    };

    const handleCreateTeam = () => {
        // Verificar que tenemos un usuario antes de navegar
        if (!user || !user._id) {
            Alert.alert("Error", "No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
            return;
        }
        
        // Navegar a la pantalla de creación de equipo
        navigation.navigate('CreateTeam', { userId: user._id });
    };

    // Personalización del renderizado de cada equipo
    const renderTeamItem = (team) => {
        return (
            <View style={styles.teamItemContainer}>
                <View style={styles.teamInfoContainer}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamCategory}>{team.category || 'Sin categoría'}</Text>
                </View>
                
                <View style={styles.actionsRow}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleViewTeamMatches(team._id)}
                    >
                        <Text style={styles.actionButtonText}>Matches</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleViewTeamPlayers(team._id)}
                    >
                        <Text style={styles.actionButtonText}>Players</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleViewTeamDetails(team._id)}
                    >
                        <Text style={styles.actionButtonText}>Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>My Teams</Text>
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFA500" />
                    <Text style={styles.loadingText}>Cargando equipos...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => {
                            setLoading(true);
                            loadTeams();
                        }}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.boxSelectorContainer}>
                    <BoxSelector
                        items={teams}
                        customRenderItem={renderTeamItem}
                        onSelect={() => {}} // Ya no necesitamos esta función
                        emptyMessage="No teams found. Create your first team!"
                    >
                        <TouchableOpacity 
                            style={styles.createButton} 
                            onPress={handleCreateTeam}
                        >
                            <Text style={styles.createButtonText}>Create a new team</Text>
                        </TouchableOpacity>
                    </BoxSelector>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF8E1",
        paddingTop: 80,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 40,
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
    },
    boxSelectorContainer: {
        width: '90%',
        height: '70%',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#FFF9E7',
        paddingVertical: 20,
        borderRadius: 8,
        width: '90%',
        alignItems: 'center',
        marginTop: 10,
    },
    createButtonText: {
        textAlign: 'center',
        fontSize: 23,
        fontWeight: '600',
    },
    // Estilos para el renderizado personalizado
    teamItemContainer: {
        width: '100%',
        backgroundColor: '#FFF9E7',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    teamInfoContainer: {
        marginBottom: 12,
    },
    teamName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    teamCategory: {
        fontSize: 14,
        color: '#777',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E6E0CE',
        paddingTop: 10,
    },
    actionButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,  // Esquinas más redondeadas
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',  // Ancho para que los tres botones quepan en la fila
    },
    actionButtonText: {
        color: 'white',  // Texto blanco para mejor contraste con fondo naranja
        fontWeight: 'bold',
        fontSize: 14,
    },
});