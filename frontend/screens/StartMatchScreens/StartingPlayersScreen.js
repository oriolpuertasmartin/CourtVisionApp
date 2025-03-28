import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import PrimaryButton from "../../components/PrimaryButton";

export default function StartingPlayersScreen({ route, navigation }) {
  const { teamId } = route.params;
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

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
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
        Alert.alert("Error", "Could not load players");
      }
    }
    fetchPlayers();
  }, [teamId]);

  const handleSelectPlayer = (player) => {
    if (selectedPlayers.includes(player._id)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== player._id));
    } else if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, player._id]);
    } else {
      Alert.alert("Limit Reached", "You can only select 5 players.");
    }
  };

  const handleStart = () => {
    if (selectedPlayers.length === 5) {
      navigation.navigate("StatsScreen", { selectedPlayers });
    } else {
      Alert.alert("Incomplete Selection", "Please select 5 players to start.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <BoxSelector
        title="Select the 5 starting players"
        items={players.map(player => ({
          ...player,
          style: selectedPlayers.includes(player._id) ? styles.selectedPlayer : null
        }))}
        onSelect={handleSelectPlayer}
      />

      <PrimaryButton
        title="Start"
        onPress={handleStart}
        style={styles.startButton}
        textStyle={styles.startButtonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  selectedPlayer: {
    backgroundColor: "orange",
  },
  startButton: {
    marginTop: 20,
    backgroundColor: "#FFA500",
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});