import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import BoxSelector from "../../components/BoxSelector";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function StartMatchScreen({ user, navigation }) {
  // Consulta para obtener equipos del usuario
  const {
    data: teams = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["teams", user?._id],
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
    enabled: !!user?._id,
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
      navigation.navigate("Start a Match", {
        screen: "OpponentTeam",
        params: { matchId: newMatch._id, teamId: newMatch.teamId },
      });
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo crear el partido.");
    },
  });

  const handleSelectTeam = (team) => {
    createMatch(team._id);
  };

  // Función para renderizar cada equipo con su logo/foto y categoría
  const renderTeamItem = (team, isSelected) => {
    return (
      // Envuelve todo en TouchableOpacity para que siga siendo un botón
      <TouchableOpacity
        style={[styles.itemButton]}
        onPress={() => handleSelectTeam(team)}
      >
        <View
          style={[
            styles.teamItemContainer,
            isSelected ? styles.selectedTeamItem : null,
          ]}
        >
          {team.team_photo ? (
            <Image source={{ uri: team.team_photo }} style={styles.teamLogo} />
          ) : (
            <View style={styles.teamLogoPlaceholder}>
              <Text style={styles.teamLogoPlaceholderText}>
                {team.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.teamInfoContainer}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamCategory}>
              {team.category || "Sin categoría"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading || isPending) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Select your team</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Cargando equipos...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Select your team</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || "Error al cargar equipos"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Select your team</Text>
      </View>
      
      <View style={styles.boxSelectorContainer}>
        <BoxSelector
          items={teams}
          onSelect={handleSelectTeam}
          emptyMessage="No teams found. Create a team first!"
          customRenderItem={renderTeamItem}
        >
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate("Teams")}
          >
            <Text style={styles.createButtonText}>Create a new team</Text>
          </TouchableOpacity>
        </BoxSelector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 60,
    alignItems: "center",
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 0,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 45,
    fontWeight: "bold",
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  boxSelectorContainer: {
    width: "95%",
    height: "90%",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  createButton: {
    backgroundColor: "#FFF9E7",
    paddingVertical: 20,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    textAlign: "center",
    fontSize: 23,
    fontWeight: "600",
  },
  itemButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
  },
  teamItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "100%",
  },
  selectedTeamItem: {
    backgroundColor: "#FFF8E1",
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 45,
    marginRight: 30,
    marginLeft: 30,
    borderWidth: 1,
    borderColor: "#E6E0CE",
  },
  teamLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  teamLogoPlaceholderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  teamInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  teamName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 3,
  },
  teamCategory: {
    fontSize: 17,
    color: "#777",
  },
});