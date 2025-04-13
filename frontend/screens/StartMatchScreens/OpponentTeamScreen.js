import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons"; 
import API_BASE_URL from "../../config/apiConfig";
import { useMutation } from '@tanstack/react-query';

export default function OpponentTeamScreen({ route, navigation }) {
  const { matchId, teamId } = route.params;
  const [formData, setFormData] = useState({
    nombre: "",
    category: "",
    photo: "",
  });

  // Mutación para actualizar el equipo oponente en el partido
  const { mutate: updateOpponentTeam, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentTeam: {
            name: data.nombre,
            category: data.category,
            photo: data.photo,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar el partido");
      }
      
      return await response.json();
    },
    onSuccess: (updatedMatch) => {
      Alert.alert("Actualizado", "Datos del partido actualizados correctamente");
      navigation.navigate('StartingPlayers', { teamId, updatedMatch });
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudieron actualizar los datos del partido");
    }
  });

  const handleSubmit = () => {
    // Validamos que al menos haya un nombre
    if (!formData.nombre.trim()) {
      Alert.alert("Datos incompletos", "Por favor ingresa al menos el nombre del equipo oponente");
      return;
    }
    
    updateOpponentTeam(formData);
  };

  return (
    <View style={styles.container}>
      {/* Flecha de retroceso personalizada */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <BoxFill
        title="New match"
        fields={[
          { name: "nombre", placeholder: "Opponent Name" },
          { name: "category", placeholder: "Category" },
          { name: "photo", placeholder: "Photo", style: { height: 80 } },
        ]}
        formData={formData}
        onChangeForm={setFormData}
      >
        <PrimaryButton 
          title={isPending ? "Guardando..." : "Start the match"} 
          onPress={handleSubmit}
          disabled={isPending} 
        />
      </BoxFill>
      
      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFF8E1",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});