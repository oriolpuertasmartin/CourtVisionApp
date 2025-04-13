import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useMutation } from '@tanstack/react-query';

export default function CreateTeamScreen({ route, navigation }) {
    const { userId } = route.params;
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        team_photo: ""
    });

    // Usar el hook de orientación
    const orientation = useOrientation();

    // Usar useMutation para crear un equipo
    const { mutate: createTeam, isPending } = useMutation({
        mutationFn: async (teamData) => {
            const response = await fetch(`${API_BASE_URL}/teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(teamData),
            });
            
            if (!response.ok) {
                throw new Error("Error creating team");
            }
            
            return await response.json();
        },
        onSuccess: (newTeam) => {
            Alert.alert(
                "Success", 
                "Team created successfully!",
                [
                    {
                        text: "Add Players",
                        onPress: () => navigation.navigate("CreatePlayer", { teamId: newTeam._id }),
                    },
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                        style: "cancel"
                    }
                ]
            );
        },
        onError: (error) => {
            Alert.alert("Error", "Failed to create team");
        }
    });

    const handleSubmit = () => {
        // Validar campos obligatorios
        if (!formData.name || !formData.category) {
            Alert.alert("Error", "Please fill in the required fields: Name and Category");
            return;
        }

        // Ejecutar la mutación
        createTeam({
            ...formData,
            user_id: userId
        });
    };

    return (
        <View style={styles.container}>
            {/* Botón para volver */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Create New Team</Text>

            <BoxFill
                title="Team Information"
                fields={[
                    { name: "name", placeholder: "Team Name *", required: true },
                    { name: "category", placeholder: "Category *", required: true },
                    { name: "team_photo", placeholder: "Team Photo URL" },
                ]}
                formData={formData}
                onChangeForm={setFormData}
            >
                <PrimaryButton
                    title={isPending ? "Creating..." : "Create Team"}
                    onPress={handleSubmit}
                    style={styles.createButton}
                    disabled={isPending}
                />
                <PrimaryButton
                    title="Add Players"
                    onPress={() => {
                        if (!formData.name || !formData.category) {
                            Alert.alert("Error", "Please create the team first");
                            return;
                        }
                        handleSubmit();
                    }}
                    style={styles.addPlayersButton}
                    disabled={isPending}
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
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        marginTop: 30,
    },
    createButton: {
        backgroundColor: "#FFA500",
        marginTop: 10,
    },
    addPlayersButton: {
        backgroundColor: "#007BFF",
        marginTop: 10,
    },
});