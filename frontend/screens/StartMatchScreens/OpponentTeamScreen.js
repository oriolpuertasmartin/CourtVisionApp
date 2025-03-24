//// filepath: frontend/screens/StartMatchScreens/OpponentTeamScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function OpponentTeamScreen({ route, navigation }) {
  const { matchId } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Partido</Text>
      <Text>Match ID: {matchId}</Text>
      {/* Aquí agregarás el formulario para los datos del oponente */}
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});