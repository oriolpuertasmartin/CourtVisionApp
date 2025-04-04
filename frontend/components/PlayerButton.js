import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function PlayerButton({ player, playerstats = {}, isSelected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.playerCard,
        isSelected && styles.selectedPlayerCard, // Cambia el estilo si está seleccionado
      ]}
      onPress={onPress} // Detecta el toque para seleccionar
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
    borderColor: "orange", // Resalta el jugador seleccionado
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