import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import PlayerButton from "../../components/PlayerButton";

export default function StatsScreen({ route }) {
  const { selectedPlayers } = route.params;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch(
          `http://localhost:3001/players?ids=${selectedPlayers.join(',')}`
        );
        if (!response.ok) {
          throw new Error("Error fetching players");
        }
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, [selectedPlayers]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Screen</Text>
      <View style={styles.startingplayersContainer}>
        {players.map((player) => (
          <PlayerButton
            key={player._id}
            player={player}
            playerstats={{
              points: 10,
              assists: 5,
              rebounds: 7,
              blocks: 2,
              steals: 3,
              turnovers: 1,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    top: 20,
  },
  startingplayersContainer: {
    flexWrap: "wrap", // Permite que los jugadores se ajusten si hay más de 5
    justifyContent: "flex-start", // Alinea los elementos al inicio horizontalmente
    alignItems: "flex-start", // Alinea los elementos al inicio verticalmente
    position: "absolute", // Posiciona el contenedor de forma absoluta
    top: 70, // Margen desde la parte superior
    left: 50, // Margen desde la izquierda
  },
});