import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import BoxSelector from "../../components/BoxSelector";

export default function StartingPlayersScreen({ route, navigation }) {
  // Expect teamId to be passed in route.params
  const { teamId } = route.params;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        if (!teamId) {
          Alert.alert("Error", "No teamId provided");
          return;
        }
        const response = await fetch(`http://localhost:3001/players/team/${teamId}`);        if (!response.ok) {
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
    // Optionally, navigate to another screen with player details:
    // navigation.navigate('PlayerDetail', { player });
  };

  return (
    <View style={styles.container}>
      <BoxSelector
        title="Select the 5 starting players"
        items={players}
        onSelect={handleSelectPlayer}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </BoxSelector>
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
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});