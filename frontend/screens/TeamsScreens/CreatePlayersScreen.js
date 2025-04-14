import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CreatePlayersScreen({ route, navigation }) {
    const { teamId } = route.params;
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        position: "",
        height: "",
        weight: "",
        age: "",
        nationality: "",
        player_photo: ""
    });

    // Consulta para obtener datos del equipo
    const {
        data: team,
        isLoading: isTeamLoading,
        isError: isTeamError
    } = useQuery({
        queryKey: ['team', teamId],
        queryFn: async () => {
            if (!teamId) return null;
            
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return await response.json();
        },
        enabled: !!teamId,
        onError: (error) => {
            Alert.alert("Error", "Failed to load team data");
            navigation.goBack();
        }
    });

    // Consulta para obtener jugadores del equipo
    const {
        data: players = [],
        isLoading: isPlayersLoading,
        isError: isPlayersError,
        refetch: refetchPlayers
    } = useQuery({
        queryKey: ['players', 'team', teamId],
        queryFn: async () => {
            if (!teamId) return [];
            
            try {
                const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
                if (!response.ok) {
                    console.error(`Error obteniendo jugadores: ${response.status}`);
                    // Si es un 404, podríamos asumir que es un equipo nuevo sin jugadores
                    if (response.status === 404) {
                        return [];
                    }
                    throw new Error(`Error: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error("Error completo:", error);
                // Si es un equipo nuevo, es normal que no tenga jugadores todavía
                return [];
            }
        },
        enabled: !!teamId,
        retry: 3,        // Aumentar el número de reintentos
        retryDelay: 1000 // Esperar 1 segundo entre reintentos
    });

    // Mutation para añadir un jugador
    const { mutate: addPlayer, isPending: isAdding } = useMutation({
        mutationFn: async (playerData) => {
            console.log("Intentando crear jugador con datos:", playerData);
            
            const response = await fetch(`${API_BASE_URL}/players`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(playerData),
            });
            
            if (!response.ok) {
                console.error("Error al crear jugador:", response.status);
                const errorData = await response.text();
                console.error("Detalles del error:", errorData);
                throw new Error(`Error creating player: ${response.status}`);
            }
            
            return await response.json();
        },
        onSuccess: (newPlayer) => {
            console.log("Jugador creado exitosamente:", newPlayer);
            setFormData({
                name: "",
                number: "",
                position: "",
                height: "",
                weight: "",
                age: "",
                nationality: "",
                player_photo: ""
            });
            
            // Actualizar caché de React Query
            queryClient.invalidateQueries({ queryKey: ['players', 'team', teamId] });
            
            Alert.alert("Success", "Player added successfully!");
        },
        onError: (error) => {
            console.error("Error en la mutación:", error);
            Alert.alert("Error", `Failed to add player: ${error.message}`);
        }
    });

    const handleAddPlayer = () => {
        // Validar campos obligatorios
        if (!formData.name || !formData.number || !formData.position) {
            Alert.alert("Error", "Please fill in the required fields: Name, Number, and Position");
            return;
        }

        // Validar que el número sea un entero positivo
        if (isNaN(parseInt(formData.number)) || parseInt(formData.number) <= 0) {
            Alert.alert("Error", "Player number must be a positive integer");
            return;
        }

        // Ejecutar la mutación
        addPlayer({
            name: formData.name,
            number: parseInt(formData.number),
            position: formData.position,
            height: formData.height ? parseInt(formData.height) : null,
            weight: formData.weight ? parseInt(formData.weight) : null,
            age: formData.age ? parseInt(formData.age) : null,
            nationality: formData.nationality || "",
            player_photo: formData.player_photo || "",
            team_id: teamId
        });
    };

    const handleFinish = () => {
        // Invalidar la caché de equipos para forzar una recarga de datos
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        
        // Navegar correctamente según la estructura de tu navegación
        try {
            // Primero intentamos con navegación anidada
            navigation.navigate("Teams", { screen: "TeamsList", params: { refresh: true } });
        } catch (error) {
            // Si falla, intentamos navegar directamente al Stack de Teams
            try {
                navigation.navigate("TeamsList", { refresh: true });
            } catch (innerError) {
                // Si todo falla, simplemente volvemos atrás
                navigation.goBack();
            }
        }
    };

    const isLoading = isTeamLoading || isPlayersLoading;

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FFA500" />
                <Text style={styles.loadingText}>Loading team data...</Text>
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
                {team ? `Add Players to ${team.name}` : "Add Players"}
            </Text>

            {/* Lista de jugadores existentes */}
            {players.length > 0 && (
                <View style={styles.playersListContainer}>
                    <Text style={styles.listTitle}>Team Players ({players.length})</Text>
                    <View style={styles.playersGrid}>
                        {players.map(player => (
                            <TouchableOpacity 
                                key={player._id} 
                                style={styles.playerChip}
                                onPress={() => Alert.alert(`${player.name}`, `Position: ${player.position}\nNumber: ${player.number}`)}
                            >
                                <Text style={styles.playerChipNumber}>#{player.number}</Text>
                                <Text style={styles.playerChipName}>{player.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Formulario para añadir jugador */}
            <BoxFill
                title="Player Information"
                fields={[
                    { name: "name", placeholder: "Name *", required: true },
                    { name: "number", placeholder: "Number *", keyboardType: "numeric", required: true },
                    { name: "position", placeholder: "Position *", required: true },
                    { name: "height", placeholder: "Height (cm)", keyboardType: "numeric" },
                    { name: "weight", placeholder: "Weight (kg)", keyboardType: "numeric" },
                    { name: "age", placeholder: "Age", keyboardType: "numeric" },
                    { name: "nationality", placeholder: "Nationality" },
                    { name: "player_photo", placeholder: "Player Photo URL" },
                ]}
                formData={formData}
                onChangeForm={setFormData}
            >
                <PrimaryButton
                    title={isAdding ? "Adding..." : "Add Player"}
                    onPress={handleAddPlayer}
                    style={styles.addButton}
                    disabled={isAdding}
                />
                <PrimaryButton
                    title="Finish"
                    onPress={handleFinish}
                    style={styles.finishButton}
                    disabled={isAdding}
                />
            </BoxFill>
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
    loadingContainer: {
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 30,
        marginBottom: 10,
        textAlign: "center",
    },
    playersListContainer: {
        width: "90%",
        maxHeight: 200,
        marginBottom: 20,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    playersList: {
        maxHeight: 150,
    },
    playerItem: {
        backgroundColor: "#E6E0CE",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    playerNumber: {
        fontSize: 18,
        fontWeight: "bold",
        marginRight: 15,
        minWidth: 40,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    playerPosition: {
        fontSize: 14,
        color: "#666",
    },
    addButton: {
        backgroundColor: "#FFA500",
        marginTop: 10,
    },
    finishButton: {
        backgroundColor: "#28a745",
        marginTop: 10,
    },
});