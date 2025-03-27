import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import BoxSelector from "../../components/BoxSelector";
import { Ionicons } from "@expo/vector-icons"; 

export default function StartingPlayersScreen({ route, navigation }) {
  const { teamId } = route.params;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        if (!teamId) {
          Alert.alert("Error", "No teamId provided");
          return;
        }
        const response = await fetch(`http://localhost:3001/players/team/${teamId}`);
        if (!response.ok) {
          throw new Error("Error fetching players");
        }
        const data = await response.json();
        console.log("Players fetched:", data);
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
        Alert.alert("Error", "Could not load players");
      }
    }
    fetchPlayers();
  }, [teamId]);

  const handleSelectPlayer = (player) => {
    Alert.alert("Player Selected", `You selected ${player.name}`);
  };

  return (
    <View style={styles.container}>
      {/* Flecha de retroceso personalizada */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <BoxSelector
        title="Select the 5 starting players"
        items={players}
        onSelect={handleSelectPlayer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
});