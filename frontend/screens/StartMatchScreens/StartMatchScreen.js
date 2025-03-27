import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import BoxSelector from "../../components/BoxSelector";

export default function StartMatchScreen({ user, navigation }) { 
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        console.log("Usuario recibido en StartMatchScreen:", user);
        if (!user || !user._id) {
          console.error("No se encontró el userId");
          return;
        }
        const response = await fetch(`http://localhost:3001/teams/user/${user._id}`);
        if (!response.ok) {
          throw new Error("Error al obtener equipos");
        }
        const data = await response.json();
        console.log("Equipos obtenidos:", data);
        setTeams(data);
      } catch (error) {
        console.error("Error al obtener equipos:", error);
        Alert.alert("Error", "No se pudieron cargar los equipos.");
      }
    }
    fetchTeams();
  }, [user]);

  const handleSelectTeam = async (team) => {
    try {
      console.log("Equipo seleccionado:", team);
      const response = await fetch("http://localhost:3001/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team._id, userId: user._id }),
      });
      if (!response.ok) {
        throw new Error("Error al crear el match");
      }
      const newMatch = await response.json();
      console.log("Match creado:", newMatch);

      navigation.navigate('Start a Match', {
        screen: 'OpponentTeam',
        params: { matchId: newMatch._id, teamId: newMatch.winnerTeam },
      });
    } catch (error) {
      console.error("Error creando match:", error);
      Alert.alert("Error", "No se pudo crear el partido.");
    }
  };

  return (
    <View style={styles.container}>
      <BoxSelector
        title="Select your team"
        items={teams}
        onSelect={handleSelectTeam}
      >
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Teams')}>
          <Text style={styles.createButtonText}>Create a new team</Text>
        </TouchableOpacity>
      </BoxSelector>
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
  createButton: {
    backgroundColor: '#FFF9E7', // Mismo color que los botones de los ítems
    paddingVertical: 20, // Mismo padding vertical
    marginBottom: 20, // Mismo margen inferior
    borderRadius: 8, // Mismo borde redondeado
    width: '95%', // Mismo ancho que los botones de los ítems
    alignItems: 'center', // Centra el contenido del botón
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 23, // Mismo tamaño de fuente que los ítems
    fontWeight: '600', // Mismo peso de fuente que los ítems
  },
});