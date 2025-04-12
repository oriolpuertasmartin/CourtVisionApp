import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";

export default function CreateTeamScreen({ route, navigation }) {
    const { userId } = route.params;
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        team_photo: ""
    });

    const handleSubmit = async () => {
        // Validar campos obligatorios
        if (!formData.name || !formData.category) {
            Alert.alert("Error", "Please fill in the required fields: Name and Category");
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    user_id: userId
                }),
            });

            if (!response.ok) {
                throw new Error("Error creating team");
            }

            const newTeam = await response.json();
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
        } catch (error) {
            console.error("Error creating team:", error);
            Alert.alert("Error", "Failed to create team");
        }
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
                    title="Create Team"
                    onPress={handleSubmit}
                    style={styles.createButton}
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