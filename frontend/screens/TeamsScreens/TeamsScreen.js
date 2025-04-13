import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import BoxSelector from "../../components/BoxSelector";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery } from '@tanstack/react-query';

export default function TeamsScreen({ navigation, route }) {
    const [user, setUser] = useState(route.params?.user || null);

    // Usar el hook de orientación
    const orientation = useOrientation();

    // Actualizar usuario si cambia en route.params
    useEffect(() => {
        if (route.params?.user) {
            setUser(route.params.user);
        }
    }, [route.params?.user]);

    // Implementación de useQuery para cargar equipos
    const {
        data: teams = [],        // (1) Destructura la propiedad data y le da un alias "teams" con valor por defecto []
        isLoading,               // (2) Estado que indica si la consulta está cargando
        isError,                 // (3) Estado que indica si hubo un error
        error: queryError,       // (4) Destructura el error y le da un alias "queryError"
        refetch                  // (5) Función para volver a ejecutar la consulta manualmente
    } = useQuery({
        queryKey: ['teams', user?._id],   // (6) Clave única para identificar esta consulta
        queryFn: async () => {            // (7) Función que ejecuta la petición
            if (!user || !user._id) return [];  // (8) Validación para no hacer la petición sin usuario
            
            const response = await fetch(`${API_BASE_URL}/teams/user/${user._id}`);  // (9) Llamada a la API
            if (!response.ok) {                                                       // (10) Validación de respuesta
                throw new Error(`Error ${response.status}: ${response.statusText}`);  // (11) Lanzar error si falla
            }
            
            return await response.json();  // (12) Parsear y devolver los datos JSON
        },
        enabled: !!user?._id,             // (13) Control para activar/desactivar la consulta
    });

    const handleViewTeamDetails = (teamId) => {
        navigation.navigate('TeamDetails', { teamId });
    };

    const handleViewTeamMatches = (teamId) => {
        navigation.navigate('TeamMatches', { teamId, userId: user?._id });
    };

    const handleViewTeamPlayers = (teamId) => {
        navigation.navigate('TeamPlayers', { teamId });
    };

    const handleCreateTeam = () => {
        if (!user || !user._id) {
            Alert.alert("Error", "No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
            return;
        }
        
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
                        onPress={() => handleViewTeamDetails(team._id)}
                    >
                        <Text style={styles.actionButtonText}>Details</Text>
                    </TouchableOpacity>
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
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>My Teams</Text>
            
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFA500" />
                    <Text style={styles.loadingText}>Cargando equipos...</Text>
                </View>
            ) : isError ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{queryError?.message || "No se pudieron cargar los equipos. Por favor, intenta de nuevo."}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => refetch()}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.boxSelectorContainer}>
                    <BoxSelector
                        items={teams}
                        customRenderItem={renderTeamItem}
                        onSelect={() => {}}
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
    // Todos los estilos se mantienen sin cambios
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
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});