import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BoxSelector from "../components/BoxSelector";

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
    backgroundColor: '#FFF8E1'
  },
  createButton: {
    backgroundColor: '#FFF9E7',
    paddingVertical: 35,
    marginBottom: 30,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '600',
  },
});