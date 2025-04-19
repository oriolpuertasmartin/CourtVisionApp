import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, Platform } from "react-native";
import BoxSelector from "../../components/BoxSelector";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "../../components/ConfirmModal"; 
import Icon from "react-native-vector-icons/MaterialIcons";

export default function TeamsScreen({ navigation, route }) {
    const [user, setUser] = useState(route.params?.user || null);
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

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
        data: teams = [],
        isLoading,
        isError,
        error: queryError,
        refetch
    } = useQuery({
        queryKey: ['teams', user?._id],
        queryFn: async () => {
            if (!user || !user._id) return [];
            
            console.log("Buscando equipos para usuario:", user._id);
            
            const response = await fetch(`${API_BASE_URL}/teams/user/${user._id}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log("Equipos recibidos:", data.length);
            return data;
        },
        enabled: !!user?._id,
    });

    // Mutación para eliminar un equipo
    const { mutate: deleteTeam, isPending: isDeleting } = useMutation({
        mutationFn: async (teamId) => {
            console.log("Intentando eliminar equipo con ID:", teamId);
            
            try {
                const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log("Respuesta del servidor:", response.status);
                
                if (!response.ok) {
                    const errorData = await response.text();
                    console.error("Error al eliminar:", errorData);
                    throw new Error(`Error al eliminar el equipo: ${response.status} ${errorData}`);
                }
                
                const data = await response.json();
                console.log("Datos de respuesta:", data);
                return data;
            } catch (error) {
                console.error("Error en la solicitud:", error);
                throw error;
            }
        },
        onSuccess: (data, teamId) => {
            console.log("Equipo eliminado exitosamente:", teamId);
            // Invalidar la caché para refrescar la lista
            queryClient.invalidateQueries({ queryKey: ['teams', user?._id] });
            setModalVisible(false);
            setTeamToDelete(null);
        },
        onError: (error) => {
            console.error("Error en mutación:", error);
            setModalVisible(false);
            setTeamToDelete(null);
            // Puedes usar una alerta básica aquí ya que se maneja después del modal
            if (Platform.OS === 'web') {
                window.alert(`Error: No se pudo eliminar el equipo: ${error.message}`);
            } else {
                Alert.alert("Error", `No se pudo eliminar el equipo: ${error.message}`);
            }
        }
    });

    const handleDeleteTeam = (teamId) => {
        console.log("handleDeleteTeam llamado para teamId:", teamId);
        if (!teamId) {
            console.error("ID de equipo inválido");
            return;
        }
        
        // En lugar de Alert.alert, usamos nuestro estado para controlar el modal
        setTeamToDelete(teamId);
        setModalVisible(true);
    };
    
    const confirmDelete = () => {
        if (teamToDelete) {
            deleteTeam(teamToDelete);
        }
    };

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
        if (!team || !team._id) {
            console.error("Equipo inválido:", team);
            return null;
        }
        
        return (
            <View style={styles.teamItemContainer}>
                {/* Botón de eliminar */}
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => {
                        console.log("Botón de eliminar presionado para equipo:", team._id);
                        handleDeleteTeam(team._id);
                    }}
                    disabled={isDeleting}
                >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
                
                <View style={styles.teamContentRow}>
                    {/* Team logo/photo */}
                    {team.team_photo ? (
                        <Image source={{ uri: team.team_photo }} style={styles.teamLogo} />
                    ) : (
                        <View style={styles.teamLogoPlaceholder}>
                            <Text style={styles.teamLogoPlaceholderText}>
                                {team.name.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    
                    <View style={styles.teamInfoContainer}>
                        <Text style={styles.teamName}>{team.name}</Text>
                        <Text style={styles.teamCategory}>{team.category || 'Sin categoría'}</Text>
                    </View>
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
            
            {/* Modal de confirmación personalizado */}
            <ConfirmModal
                visible={modalVisible}
                title="Confirmar eliminación"
                message="¿Estás seguro que deseas eliminar este equipo? Esta acción no se puede deshacer."
                onConfirm={confirmDelete}
                onCancel={() => {
                    setModalVisible(false);
                    setTeamToDelete(null);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: 80,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 30,
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
        height: '85%',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    createButton: {
        backgroundColor: '#E38D2C',
        paddingVertical: 20,
        borderRadius: 20,
        width: 500,
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'center',
    },
    createButtonText: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    teamItemContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        position: 'relative', // Para posicionar el botón de eliminar
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 10, // Incrementado para área de toque más grande
    },
    teamInfoContainer: {
        marginBottom: 12,
    },
    teamName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    teamCategory: {
        fontSize: 17,
        color: '#777',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: 10,
        paddingLeft: 25,
        gap: 10,
    },
    actionButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 6,
        paddingHorizontal: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 300,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17,
    },
    teamContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingLeft: 25,
    },
    teamLogo: {
        width: 80,
        height: 80,
        borderRadius: 45,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#E6E0CE',
    },
    teamLogoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 45,
        backgroundColor: '#F4CC8D',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    teamLogoPlaceholderText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    }
});