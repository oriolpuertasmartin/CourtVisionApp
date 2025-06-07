import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import BoxSelector from "../../components/BoxSelector";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "../../components/ConfirmModal";
import ScreenHeader from "../../components/ScreenHeader";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function TeamsScreen({ navigation, route }) {
  const [user, setUser] = useState(route.params?.user || null);
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
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

  // Usar el hook de orientación
  const orientation = useOrientation();

  // Actualizar usuario si cambia en route.params
  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
    }
  }, [route.params?.user]);

  // Implementación de useQuery para cargar equipos
  const {
    data: teams = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["teams", user?._id],
    queryFn: async () => {
      if (!user || !user._id) return [];

      console.log("Buscando equipos para usuario:", user._id);

      const response = await fetch(`${API_BASE_URL}/teams/user/${user._id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Equipos recibidos:", data.length);
      return data;
    },
    enabled: !!user?._id,
  });

  // Mutación para eliminar un equipo
  const { mutate: deleteTeam, isPending: isDeleting } = useMutation({
    mutationFn: async (teamId) => {
      console.log("Intentando eliminar equipo con ID:", teamId);

      try {
        const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Respuesta del servidor:", response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Error al eliminar:", errorData);
          throw new Error(
            `Error deleting team: ${response.status} ${errorData}`
          );
        }

        const data = await response.json();
        console.log("Datos de respuesta:", data);
        return data;
      } catch (error) {
        console.error("Error en la solicitud:", error);
        throw error;
      }
    },
    onSuccess: (data, teamId) => {
      console.log("Equipo eliminado exitosamente:", teamId);
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["teams", user?._id] });
      setModalVisible(false);
      setTeamToDelete(null);
    },
    onError: (error) => {
      console.error("Error en mutación:", error);
      setModalVisible(false);
      setTeamToDelete(null);
      // Puedes usar una alerta básica aquí ya que se maneja después del modal
      if (Platform.OS === "web") {
        window.alert(`Error: Could not delete team: ${error.message}`);
      } else {
        Alert.alert("Error", `Could not delete team: ${error.message}`);
      }
    },
  });

  const handleDeleteTeam = (teamId) => {
    console.log("handleDeleteTeam llamado para teamId:", teamId);
    if (!teamId) {
      console.error("ID de equipo inválido");
      return;
    }

    // En lugar de Alert.alert, usamos nuestro estado para controlar el modal
    setTeamToDelete(teamId);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete);
    }
  };

  const handleViewTeamDetails = (teamId) => {
    navigation.navigate("TeamDetails", { teamId });
  };

  const handleViewTeamMatches = (teamId) => {
    navigation.navigate("TeamMatches", { teamId, userId: user?._id });
  };

  const handleViewTeamPlayers = (teamId) => {
    navigation.navigate("TeamPlayers", { teamId });
  };

  const handleCreateTeam = () => {
    if (!user || !user._id) {
      Alert.alert(
        "Error",
        "Could not identify the user. Please log in again."
      );
      return;
    }

    navigation.navigate("CreateTeam", { userId: user._id });
  };

  // Personalización del renderizado de cada equipo
  const renderTeamItem = (team) => {
    if (!team || !team._id) {
      console.error("Equipo inválido:", team);
      return null;
    }

    const isDesktop = deviceType === 'desktop';
    
    return (
      <View style={styles.teamItemContainer}>
        {/* Botón de eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            console.log("Botón de eliminar presionado para equipo:", team._id);
            handleDeleteTeam(team._id);
          }}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>

        <View style={styles.teamContentRow}>
          {/* Team logo/photo */}
          {team.team_photo ? (
            <Image source={{ uri: team.team_photo }} style={[
              styles.teamLogo,
              isDesktop && styles.teamLogoDesktop
            ]} />
          ) : (
            <View style={[
              styles.teamLogoPlaceholder,
              isDesktop && styles.teamLogoPlaceholderDesktop
            ]}>
              <Text style={[
                styles.teamLogoPlaceholderText,
                isDesktop && styles.teamLogoPlaceholderTextDesktop
              ]}>
                {team.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.teamInfoContainer}>
            <Text style={[
              styles.teamName,
              isDesktop && styles.teamNameDesktop
            ]}>
              {team.name}
            </Text>
            <Text style={[
              styles.teamCategory,
              isDesktop && styles.teamCategoryDesktop
            ]}>
              {team.category || "No category"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isDesktop && styles.actionButtonDesktop
            ]}
            onPress={() => handleViewTeamDetails(team._id)}
          >
            <Text style={[
              styles.actionButtonText,
              isDesktop && styles.actionButtonTextDesktop
            ]}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isDesktop && styles.actionButtonDesktop
            ]}
            onPress={() => handleViewTeamMatches(team._id)}
          >
            <Text style={[
              styles.actionButtonText,
              isDesktop && styles.actionButtonTextDesktop
            ]}>Matches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isDesktop && styles.actionButtonDesktop
            ]}
            onPress={() => handleViewTeamPlayers(team._id)}
          >
            <Text style={[
              styles.actionButtonText,
              isDesktop && styles.actionButtonTextDesktop
            ]}>Players</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Componente para renderizar cuando está cargando
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FFA500" />
      <Text style={styles.loadingText}>Loading teams...</Text>
    </View>
  );

  // Componente para renderizar cuando hay error
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {queryError?.message ||
          "Could not load teams. Please try again."}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => refetch()}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Componente para renderizar la lista de equipos
  const renderTeamsList = () => (
    <View style={styles.content}>
      <View style={styles.boxSelectorContainer}>
        <BoxSelector
          items={teams}
          customRenderItem={renderTeamItem}
          onSelect={() => {}}
          emptyMessage="No teams found. Create your first team!"
        >
          <TouchableOpacity
            style={[
              styles.createButton,
              deviceType === 'desktop' && styles.createButtonDesktop
            ]}
            onPress={handleCreateTeam}
          >
            <Text style={[
              styles.createButtonText,
              deviceType === 'desktop' && styles.createButtonTextDesktop
            ]}>
              Create a new team
            </Text>
          </TouchableOpacity>
        </BoxSelector>
      </View>
    </View>
  );

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      <ScreenHeader
        title="My teams"
        showBackButton={false}
        isMainScreen={true}
      />
    
      {isLoading ? renderLoading() : isError ? renderError() : renderTeamsList()}

      {/* Modal de confirmación personalizado */}
      <ConfirmModal
        visible={modalVisible}
        title="Confirm deletion"
        message="Are you sure you want to delete this team? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setModalVisible(false);
          setTeamToDelete(null);
        }}
      />
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
    flex: 1,
  },
  boxSelectorContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
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
  createButton: {
    backgroundColor: "#EB840B",
    paddingVertical: 20,
    borderRadius: 20,
    width: "90%", 
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  createButtonDesktop: {
    width: 500,
    paddingVertical: 24,
  },
  createButtonText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  createButtonTextDesktop: {
    fontSize: 22,
  },
  teamItemContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 10,
  },
  teamInfoContainer: {
    marginBottom: 12,
  },
  teamName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 3,
  },
  teamNameDesktop: {
    fontSize: 26,
    marginBottom: 5,
  },
  teamCategory: {
    fontSize: 17,
    color: "#777",
  },
  teamCategoryDesktop: {
    fontSize: 20,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingLeft: 25,
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  actionButtonDesktop: {
    paddingVertical: 8,
    paddingHorizontal: 40,
    minWidth: 140,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  actionButtonTextDesktop: {
    fontSize: 17,
  },
  teamContentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 25,
  },
  teamLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 20,
    borderWidth: 1,
    borderColor: "#E6E0CE",
  },
  teamLogoDesktop: {
    width: 80,
    height: 80,
    borderRadius: 45,
    marginRight: 30,
    marginLeft: 10,
  },
  teamLogoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F4CC8D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  teamLogoPlaceholderDesktop: {
    width: 80, 
    height: 80,
    borderRadius: 45,
  },
  teamLogoPlaceholderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  teamLogoPlaceholderTextDesktop: {
    fontSize: 18,
  },
});