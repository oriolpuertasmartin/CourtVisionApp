import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";

export default function CreatePlayersScreen({ route, navigation }) {
    const { teamId } = route.params;
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // Cargar datos del equipo
    useEffect(() => {
        if (!teamId) {
            Alert.alert("Error", "No team ID provided");
            navigation.goBack();
            return;
        }

        const fetchTeamData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
                if (response.ok) {
                    const data = await response.json();
                    setTeam(data);
                } else {
                    throw new Error(`Error: ${response.status}`);
                }
            } catch (error) {
                console.error("Error loading team data:", error);
                Alert.alert("Error", "Failed to load team data");
            } finally {
                setLoading(false);
            }
        };

        const fetchPlayers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPlayers(data);
                } else {
                    throw new Error(`Error: ${response.status}`);
                }
            } catch (error) {
                console.error("Error loading players:", error);
                Alert.alert("Error", "Failed to load team players");
            }
        };

        fetchTeamData();
        fetchPlayers();
    }, [teamId, navigation]);

    const handleAddPlayer = async () => {
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

        try {
            const response = await fetch(`${API_BASE_URL}/players`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    number: parseInt(formData.number),
                    position: formData.position,
                    height: formData.height ? parseInt(formData.height) : null,
                    weight: formData.weight ? parseInt(formData.weight) : null,
                    age: formData.age ? parseInt(formData.age) : null,
                    nationality: formData.nationality || "",
                    player_photo: formData.player_photo || "",
                    team_id: teamId
                }),
            });

            if (!response.ok) {
                throw new Error("Error adding player");
            }

            // Limpiar formulario
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

            // Actualizar lista de jugadores
            const newPlayer = await response.json();
            setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
            
            Alert.alert("Success", "Player added successfully!");
        } catch (error) {
            console.error("Error adding player:", error);
            Alert.alert("Error", "Failed to add player");
        }
    };

    const handleFinish = () => {
        // Navegar correctamente según la estructura de tu navegación
        try {
            // Primero intentamos con navegación anidada
            navigation.navigate("Teams", { screen: "TeamsList" });
        } catch (error) {
            console.error("Error navigating with nested navigation:", error);
            
            // Si falla, intentamos navegar directamente al Stack de Teams
            try {
                navigation.navigate("TeamsList");
            } catch (innerError) {
                console.error("Error navigating to TeamsList:", innerError);
                
                // Si todo falla, simplemente volvemos atrás
                navigation.goBack();
            }
        }
    };

    if (loading) {
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
                    <ScrollView style={styles.playersList}>
                        {players.map(player => (
                            <View key={player._id} style={styles.playerItem}>
                                <Text style={styles.playerNumber}>#{player.number}</Text>
                                <View style={styles.playerInfo}>
                                    <Text style={styles.playerName}>{player.name}</Text>
                                    <Text style={styles.playerPosition}>{player.position}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
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
                    title="Add Player"
                    onPress={handleAddPlayer}
                    style={styles.addButton}
                />
                <PrimaryButton
                    title="Finish"
                    onPress={handleFinish}
                    style={styles.finishButton}
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