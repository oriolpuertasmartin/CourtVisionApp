import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatsScreen({ route }) {
  const { selectedPlayers } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Screen</Text>
      <Text>Selected Players:</Text>
      {selectedPlayers.map((playerId, index) => (
        <Text key={index}>{playerId}</Text>
      ))}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});