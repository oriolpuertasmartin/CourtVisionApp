import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function PlayerButton({ player, playerstats = {}, isSelected, onPress }) {
  // Calcular porcentajes de tiro
  const fgPct = playerstats.fieldGoalsAttempted > 0 
    ? Math.round((playerstats.fieldGoalsMade / playerstats.fieldGoalsAttempted) * 100) 
    : 0;
  
  const ftPct = playerstats.freeThrowsAttempted > 0 
    ? Math.round((playerstats.freeThrowsMade / playerstats.freeThrowsAttempted) * 100)
    : 0;
  
  const twosPct = playerstats.twoPointsAttempted > 0
    ? Math.round((playerstats.twoPointsMade / playerstats.twoPointsAttempted) * 100)
    : 0;
    
  const threesPct = playerstats.threePointsAttempted > 0
    ? Math.round((playerstats.threePointsMade / playerstats.threePointsAttempted) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[
        styles.playerCard,
        isSelected && styles.selectedPlayerCard,
      ]}
      onPress={onPress}
    >
      <Text style={styles.playerName}>
        {player.name} #{player.number}
      </Text>
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>{playerstats.points || 0}p</Text>
        <Text style={styles.stat}>{playerstats.assists || 0}a</Text>
        <Text style={styles.stat}>{playerstats.rebounds || 0}r</Text>
        <Text style={styles.stat}>{playerstats.blocks || 0}b</Text>
        <Text style={styles.stat}>{playerstats.steals || 0}s</Text>
        <Text style={styles.stat}>{playerstats.turnovers || 0}t</Text>
      </View>
      <View style={styles.shootingContainer}>
        <Text style={styles.shootingStat}>FG: {fgPct}%</Text>
        <Text style={styles.shootingStat}>FT: {ftPct}%</Text>
        <Text style={styles.shootingStat}>2P: {twosPct}%</Text>
        <Text style={styles.shootingStat}>3P: {threesPct}%</Text>
      </View>
    </TouchableOpacity>
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
  selectedPlayerCard: {
    borderWidth: 2,
    borderColor: "orange",
  },
  playerName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  stat: {
    fontSize: 14,
  },
  shootingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 5,
  },
  shootingStat: {
    fontSize: 12,
    color: "#555",
  }
});