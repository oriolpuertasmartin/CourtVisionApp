//// filepath: c:\Users\Marc\Escritorio\miApp\CourtVisionApp\frontend\screens\StartMatchScreen.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import BoxSelector from "../components/BoxSelector";

export default function StartMatchScreen({ user }) { 
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        console.log("Usuario recibido en StartMatchScreen:", user);
        if (!user || !user._id) {  // Usamos _id, que es el nombre real del campo
          console.error("No se encontró el userId");
          return;
        }

        const response = await fetch(`http://localhost:3001/teams/user/${user._id}`);
        const data = await response.json();
        console.log("Equipos obtenidos:", data);
        setTeams(data);
      } catch (error) {
        console.error("Error al obtener equipos:", error);
      }
    }
    fetchTeams();
  }, [user]);

  const handleSelectTeam = (team) => {
    console.log("Equipo seleccionado:", team.name);
  };

  return (
    <View style={styles.container}>
      <BoxSelector
        title="Select a Team"
        items={teams}
        onSelect={handleSelectTeam}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1'
  },
});