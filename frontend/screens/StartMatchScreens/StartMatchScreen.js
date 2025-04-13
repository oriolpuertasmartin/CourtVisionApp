import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import BoxSelector from "../../components/BoxSelector";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation } from '@tanstack/react-query';

export default function StartMatchScreen({ user, navigation }) { 
  // Consulta para obtener equipos del usuario
  const {
    data: teams = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['teams', user?._id],
    queryFn: async () => {
      if (!user || !user._id) {
        throw new Error("No se encontró el userId");
      }
      const response = await fetch(`${API_BASE_URL}/teams/user/${user._id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener equipos: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!user?._id
  });

  // Mutación para crear un nuevo partido
  const { mutate: createMatch, isPending } = useMutation({
    mutationFn: async (teamId) => {
      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, userId: user._id }),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el match");
      }
      
      return await response.json();
    },
    onSuccess: (newMatch) => {
      navigation.navigate('Start a Match', {
        screen: 'OpponentTeam',
        params: { matchId: newMatch._id, teamId: newMatch.teamId },
      });
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo crear el partido.");
    }
  });

  const handleSelectTeam = (team) => {
    createMatch(team._id);
  };

  if (isLoading || isPending) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando equipos...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error?.message || "Error al cargar equipos"}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BoxSelector
        title="Select your team"
        items={teams}
        onSelect={handleSelectTeam}
        emptyMessage="No teams found. Create a team first!"
      >
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => navigation.navigate('Teams')}
        >
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    color: "#666",
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#FFF9E7',
    paddingVertical: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '600',
  },
});