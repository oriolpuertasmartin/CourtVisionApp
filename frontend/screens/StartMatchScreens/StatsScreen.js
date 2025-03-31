import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import PlayerButton from "../../components/PlayerButton";
import StatsButtons from "../../components/StatsButtons";

export default function StatsScreen({ route }) {
  const { selectedPlayers } = route.params;
  const [startingPlayers, setStartingPlayers] = useState([]);
  const [benchPlayers, setBenchPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        // Fetch de los jugadores titulares
        const responseStarting = await fetch(
          `http://localhost:3001/players?ids=${selectedPlayers.join(",")}`
        );
        if (!responseStarting.ok) {
          throw new Error("Error fetching starting players");
        }
        const startingData = await responseStarting.json();
        setStartingPlayers(startingData);

        // Fetch de todos los jugadores
        const responseAll = await fetch("http://localhost:3001/players");
        if (!responseAll.ok) {
          throw new Error("Error fetching all players");
        }
        const allPlayers = await responseAll.json();
        // Aquí filtro los que son bench players
        const bench = allPlayers.filter(
          (player) => !selectedPlayers.includes(player._id)
        );
        setBenchPlayers(bench);
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
      {/* Contenedor de starting players */}
      <View style={styles.topContainer}>
        <Text style={styles.title}>Stats Screen</Text>
        <View style={styles.startingplayersContainer}>
          {startingPlayers.map((player) => (
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

      {/* Aquí renderizamos los botones de estadísticas */}
      <StatsButtons />

      {/* Contenedor de bench players fijado abajo */}
      <View style={styles.bottomContainer}>
        <View style={styles.benchPlayersContainer}>
          {benchPlayers.map((player) => (
            <View key={player._id} style={styles.benchItem}>
              <PlayerButton
                player={player}
                playerstats={{
                  points: 5,
                  assists: 2,
                  rebounds: 3,
                  blocks: 1,
                  steals: 1,
                  turnovers: 2,
                }}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  topContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    top: 20,
  },
  startingplayersContainer: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "absolute",
    top: 70,
    left: 50,
  },
  benchPlayersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", // Alinea los elementos a la izquierda
    alignItems: "flex-start", // Asegura que se peguen al margen izquierdo
    width: "35%", // Limita los elementos a la mitad izquierda de la pantalla
    position: "absolute",
    left: 0, // Se pega al borde izquierdo
    paddingLeft: 48, // Pequeño margen para no tocar el borde extremo
    gap: 5, // Reduce el espacio entre elementos
  },
  
  benchItem: {
    width: "48%", // Dos elementos por fila
    padding: 3, // Reduce el padding para más compacidad
    marginBottom: 1, // Reduce el espacio entre filas
  },
});