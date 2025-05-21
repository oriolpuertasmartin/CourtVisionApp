import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function TeamDetailsScreen({ route, navigation }) {
  const { teamId } = route.params;
  const queryClient = useQueryClient();
  const deviceType = useDeviceType();

  // Para detectar el tamaño de la pantalla y ajustar el layout
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isLargeScreen = screenWidth > 768;

  // Actualizar dimensiones cuando cambie el tamaño de la pantalla
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editableTeam, setEditableTeam] = useState({
    name: "",
    category: "",
    team_photo: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Consulta para obtener los datos del equipo
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar el equipo: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!teamId,
    onSuccess: (data) => {
      // Inicializar los valores editables cuando se carga el equipo
      setEditableTeam({
        name: data.name || "",
        category: data.category || "",
        team_photo: data.team_photo || "",
      });
      if (data.team_photo) {
        setImagePreview(data.team_photo);
      }
    },
  });

  // Asegurar que editableTeam tenga los valores actualizados cuando cambia el equipo
  useEffect(() => {
    if (team && !isEditing) {
      setEditableTeam({
        name: team.name || "",
        category: team.category || "",
        team_photo: team.team_photo || "",
      });
      if (team.team_photo) {
        setImagePreview(team.team_photo);
      }
    }
  }, [team, isEditing]);

  // Función para seleccionar una imagen
  const pickImage = async () => {
    if (!isEditing) return;

    // Pedir permisos para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload images."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2, // Reduced quality (0.2 = 20% quality)
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      // Limit the image size by checking the base64 length
      const base64Data = result.assets[0].base64;

      // If the base64 string is too large (over ~800KB), compress further or alert the user
      if (base64Data && base64Data.length > 800000) {
        Alert.alert(
          "Image too large",
          "Please select a smaller image or use lower quality photos (under 1MB)."
        );
        return;
      }

      // Extract file extension reliably using a regex pattern
      let fileExtension = "png"; // Default extension
      try {
        const match = result.assets[0].uri.match(/\.([a-zA-Z0-9]+)$/);
        if (match && match[1]) {
          fileExtension = match[1].toLowerCase();
        }
      } catch (error) {
        console.log("Error extracting file extension:", error);
      }

      // Create base64 URL with proper format
      const imageUri = `data:image/${fileExtension};base64,${base64Data}`;
      setEditableTeam({
        ...editableTeam,
        team_photo: imageUri,
      });
      setImagePreview(result.assets[0].uri);
    }
  };

  // Consulta para obtener los jugadores del equipo
  const {
    data: players = [],
    isLoading: isPlayersLoading,
    isError: isPlayersError,
    error: playersError,
  } = useQuery({
    queryKey: ["players", "team", teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar los jugadores: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!teamId,
  });

  // Consulta para obtener todos los partidos
  const {
    data: allMatches = [],
    isLoading: isMatchesLoading,
    isError: isMatchesError,
    error: matchesError,
  } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/matches`);
      if (!response.ok) {
        throw new Error(`Error al cargar los partidos: ${response.status}`);
      }
      return await response.json();
    },
  });

  // Mutación para actualizar el equipo
  const { mutate: updateTeam, isPending: isSaving } = useMutation({
    mutationFn: async (updatedTeamData) => {
      console.log("Enviando datos de actualización:", updatedTeamData);
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTeamData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error de respuesta:", errorText);
        throw new Error(`Error al actualizar el equipo: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Equipo actualizado con éxito:", data);

      // Actualizar editableTeam con los datos confirmados desde el servidor
      setEditableTeam({
        name: data.name || "",
        category: data.category || "",
        team_photo: data.team_photo || "",
      });

      // Invalidar la consulta para recargar los datos
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });

      // Salir del modo edición
      setIsEditing(false);

      Alert.alert("Success", "Team updated successfully!");
    },
    onError: (error) => {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", `Failed to update team: ${error.message}`);
    },
  });

  // Filtrar los partidos del equipo usando useMemo para evitar cálculos innecesarios
  const matches = useMemo(() => {
    if (!allMatches.length || !teamId) return [];

    return allMatches
      .filter(
        (match) =>
          match.teamId === teamId ||
          (match.opponentTeam && match.opponentTeam._id === teamId)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allMatches, teamId]);

  // Calcular estadísticas del equipo también con useMemo
  const stats = useMemo(() => {
    const totalMatches = matches.length;

    // Usar los valores directamente del objeto team en lugar de calcularlos
    const wins = team?.wins || 0;
    const losses = team?.losses || 0;
    const nPlayers = players.length;

    return {
      totalMatches,
      wins,
      losses,
      nPlayers,
    };
  }, [matches, players, team]);

  // Función para manejar la edición
  const handleEditToggle = () => {
    if (isEditing) {
      // Si estábamos editando, cancelamos y restauramos los valores originales
      setEditableTeam({
        name: team?.name || "",
        category: team?.category || "",
        team_photo: team?.team_photo || "",
      });
      setImagePreview(team?.team_photo || null);
    } else {
      // Si vamos a empezar a editar, aseguramos que tengamos los valores actuales
      setEditableTeam({
        name: team?.name || "",
        category: team?.category || "",
        team_photo: team?.team_photo || "",
      });
      setImagePreview(team?.team_photo || null);
    }
    setIsEditing(!isEditing);
  };

  // Función para guardar cambios
  const handleSaveChanges = () => {
    if (!editableTeam.name.trim()) {
      Alert.alert("Error", "Team name cannot be empty");
      return;
    }

    console.log("Guardando cambios:", editableTeam);
    updateTeam({
      name: editableTeam.name,
      category: editableTeam.category,
      team_photo: editableTeam.team_photo,
    });
  };

  // Verificar estado de carga y error
  const isLoading = isTeamLoading || isPlayersLoading || isMatchesLoading;
  const isError = isTeamError || isPlayersError || isMatchesError;
  const errorMessage =
    teamError?.message || playersError?.message || matchesError?.message;

  if (isLoading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>
            Cargando información del equipo...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            {errorMessage || "Error al cargar datos"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchTeam()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Botón para volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Cabecera del equipo */}
        <View style={styles.teamHeader}>
          <TouchableOpacity
            onPress={isEditing ? pickImage : undefined}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            {imagePreview || team?.team_photo ? (
              <View>
                <Image
                  source={{ uri: imagePreview || team.team_photo }}
                  style={styles.teamPhoto}
                />
                {isEditing && (
                  <View style={styles.photoOverlay}>
                    <Ionicons name="camera" size={24} color="white" />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {editableTeam.name?.substring(0, 2) || "T"}
                </Text>
                {isEditing && (
                  <View style={styles.photoOverlay}>
                    <Ionicons name="camera" size={24} color="white" />
                  </View>
                )}
              </View>
            )}
            {isEditing && (
              <Text style={styles.changePhotoText}>Tap to change photo</Text>
            )}
          </TouchableOpacity>

          {/* Botón para editar/guardar */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={isEditing ? handleSaveChanges : handleEditToggle}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name={isEditing ? "save-outline" : "create-outline"}
                size={20}
                color="white"
              />
            )}
            <Text style={styles.editButtonText}>
              {isEditing ? " Save" : " Edit"}
            </Text>
          </TouchableOpacity>

          {/* Botón para cancelar edición - solo visible en modo edición */}
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleEditToggle}
              disabled={isSaving}
            >
              <Ionicons name="close-outline" size={20} color="white" />
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {/* Nombre del equipo - editable o no según el modo */}
          {isEditing ? (
            <TextInput
              style={styles.teamNameInput}
              value={editableTeam.name}
              onChangeText={(text) =>
                setEditableTeam((prev) => ({ ...prev, name: text }))
              }
              placeholder="Team Name"
              maxLength={30}
            />
          ) : (
            <Text style={styles.teamName}>{team?.name || "Team"}</Text>
          )}

          {/* Categoría del equipo - editable o no según el modo */}
          {isEditing ? (
            <TextInput
              style={styles.teamCategoryInput}
              value={editableTeam.category}
              onChangeText={(text) =>
                setEditableTeam((prev) => ({ ...prev, category: text }))
              }
              placeholder="Category"
              maxLength={20}
            />
          ) : (
            <Text style={styles.teamCategory}>
              {team?.category || "No category"}
            </Text>
          )}
        </View>

        {/* Resumen de estadísticas */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Team Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMatches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.nPlayers}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
          </View>
        </View>

        {/* Lista de jugadores */}
        <View style={styles.playersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Team Players ({players.length})
            </Text>

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("TeamPlayers", { teamId })}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>

          {players.length === 0 ? (
            <Text style={styles.emptyMessage}>No players in this team</Text>
          ) : (
            players.slice(0, 3).map((player) => (
              <View key={player._id} style={styles.playerCard}>
                <View style={styles.playerNumber}>
                  <Text style={styles.numberText}>#{player.number || "0"}</Text>
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerPosition}>
                    {player.position || "No position"}
                  </Text>
                </View>
              </View>
            ))
          )}

          {players.length > 3 && (
            <Text style={styles.morePlayersText}>
              +{players.length - 3} more players...
            </Text>
          )}
        </View>

        {/* Últimos partidos */}
        <View style={styles.recentMatchesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                navigation.navigate("TeamMatches", {
                  teamId,
                  userId: team?.userId,
                })
              }
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>

          {matches.length === 0 ? (
            <Text style={styles.emptyMessage}>No matches played yet</Text>
          ) : (
            matches.slice(0, 3).map((match) => (
              <View key={match._id} style={styles.matchCard}>
                <Text style={styles.matchDate}>
                  {new Date(match.date).toLocaleDateString()}
                </Text>
                <View style={styles.matchScore}>
                  <Text style={styles.teamText}>{team?.name}</Text>
                  <Text style={styles.scoreText}>
                    {match.teamAScore || 0} - {match.teamBScore || 0}
                  </Text>
                  <Text style={styles.teamText}>
                    {match.opponentTeam?.name || "Opponent"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewStatsButton}
                  onPress={() =>
                    navigation.navigate("StatsView", { matchId: match._id })
                  }
                >
                  <Text style={styles.viewStatsButtonText}>View Stats</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {matches.length > 3 && (
            <Text style={styles.moreMatchesText}>
              +{matches.length - 3} more matches...
            </Text>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    padding: 20,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F6EE",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 30,
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 100,
  },
  teamHeader: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 60,
  },
  teamPhoto: {
    width: 170,
    height: 170,
    borderRadius: 100,
    marginBottom: 10,
  },
  photoPlaceholder: {
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: "#E6E0CE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  photoPlaceholderText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFA500",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 170,
    height: 170,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: {
    fontSize: 14,
    color: "#FFA500",
    textAlign: "center",
    marginBottom: 10,
  },
  teamName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  teamCategory: {
    fontSize: 18,
    color: "#666",
  },
  teamNameInput: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#FFA500",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: "white",
    minWidth: 200,
  },
  teamCategoryInput: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#FFA500",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: "white",
    minWidth: 150,
  },
  editButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 15,
    zIndex: 5,
  },
  cancelButton: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#999",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 15,
    zIndex: 5,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E0CE",
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    backgroundColor: "#FFA500",
    padding: 8,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    flex: 1,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statItem: {
    backgroundColor: "#F9F6EE",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    width: "48%",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFA500",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  playersContainer: {
    marginBottom: 20,
  },
  playerCard: {
    flexDirection: "row",
    backgroundColor: "#F9F6EE",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playerNumber: {
    backgroundColor: "#FFA500",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  numberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  playerPosition: {
    fontSize: 14,
    color: "#666",
  },
  morePlayersText: {
    textAlign: "center",
    padding: 10,
    color: "#888",
    fontStyle: "italic",
  },
  recentMatchesContainer: {
    marginBottom: 30,
  },
  matchCard: {
    backgroundColor: "#F9F6EE",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  matchScore: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  teamText: {
    fontSize: 14,
    fontWeight: "bold",
    width: "40%",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    width: "20%",
    textAlign: "center",
  },
  viewStatsButton: {
    backgroundColor: "#FFA500",
    borderRadius: 5,
    paddingVertical: 8,
    alignItems: "center",
  },
  viewStatsButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  moreMatchesText: {
    textAlign: "center",
    padding: 10,
    color: "#888",
    fontStyle: "italic",
  },
  emptyMessage: {
    textAlign: "center",
    padding: 20,
    color: "#666",
    fontStyle: "italic",
    backgroundColor: "white",
    borderRadius: 10,
  },
});