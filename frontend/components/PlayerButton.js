import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PlayerButton({ player, playerstats }) {
  return (
    <View style={styles.playerCard}>
      <Text style={styles.playerName}>
        {player.name} #{player.number}
      </Text>
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>{playerstats.points}p</Text>
        <Text style={styles.stat}>{playerstats.assists}a</Text>
        <Text style={styles.stat}>{playerstats.rebounds}r</Text>
        <Text style={styles.stat}>{playerstats.blocks}b</Text>
        <Text style={styles.stat}>{playerstats.steals}s</Text>
        <Text style={styles.stat}>{playerstats.turnovers}t</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerCard: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: 250,
  },
  playerName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    fontSize: 14,
  },
});