import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../../components/ConfirmModal";
import * as ImagePicker from "expo-image-picker";
import SubpageTitle from "../../components/SubpageTitle";

export default function TeamPlayersScreen({ route, navigation }) {
  const { teamId } = route.params;
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  // Estados para la edición de jugadores
  const [isEditing, setIsEditing] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [editablePlayer, setEditablePlayer] = useState({
    name: "",
    number: "",
    position: "",
    height: "",
    weight: "",
    player_photo: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Usar el hook de orientación
  const orientation = useOrientation();

  // Consulta para obtener la información del equipo
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
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
  });

  // Consulta para obtener los jugadores del equipo
  const {
    data: players = [],
    isLoading: isPlayersLoading,
    isError: isPlayersError,
    error: playersError,
    refetch: refetchPlayers,
  } = useQuery({
    queryKey: ["players", teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar los jugadores: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!teamId,
  });

  const handleAddPlayer = () => {
    navigation.navigate("CreatePlayer", { teamId });
  };

  // Mutación para eliminar un jugador
  const { mutate: deletePlayer, isPending: isDeleting } = useMutation({
    mutationFn: async (playerId) => {
      console.log("Intentando eliminar jugador con ID:", playerId);

      try {
        const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Respuesta del servidor:", response.status);

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `Error al eliminar el jugador: ${response.status} ${errorData}`
          );
        }

        return await response.json();
      } catch (error) {
        console.error("Error en la solicitud:", error);
        throw error;
      }
    },
    onSuccess: (data, playerId) => {
      console.log("Jugador eliminado exitosamente:", playerId);
      // Invalidar la caché para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["players", teamId] });
      setModalVisible(false);
      setPlayerToDelete(null);
    },
    onError: (error) => {
      console.error("Error en mutación:", error);
      setModalVisible(false);
      setPlayerToDelete(null);
      Alert.alert("Error", `No se pudo eliminar el jugador: ${error.message}`);
    },
  });

  // Mutación para actualizar un jugador
  const { mutate: updatePlayer, isPending: isUpdating } = useMutation({
    mutationFn: async (playerData) => {
      const { id, ...updateData } = playerData;

      console.log("Actualizando jugador:", id, updateData);

      const response = await fetch(`${API_BASE_URL}/players/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Error al actualizar el jugador: ${response.status} ${errorData}`
        );
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Jugador actualizado exitosamente:", data);
      queryClient.invalidateQueries({ queryKey: ["players", teamId] });
      setIsEditing(false);
      setPlayerToEdit(null);
      setImagePreview(null);
      Alert.alert("Éxito", "Jugador actualizado correctamente");
    },
    onError: (error) => {
      console.error("Error en mutación:", error);
      Alert.alert(
        "Error",
        `No se pudo actualizar el jugador: ${error.message}`
      );
    },
  });

  const handleDeletePlayer = (playerId) => {
    console.log("handleDeletePlayer llamado para playerId:", playerId);
    if (!playerId) {
      console.error("ID de jugador inválido");
      return;
    }

    // Mostrar el modal de confirmación
    setPlayerToDelete(playerId);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      deletePlayer(playerToDelete);
    }
  };

  // Funciones para manejar la edición
  const handleEditPlayer = (player) => {
    setPlayerToEdit(player);
    setEditablePlayer({
      name: player.name || "",
      number: player.number?.toString() || "",
      position: player.position || "",
      height: player.height?.toString() || "",
      weight: player.weight?.toString() || "",
      player_photo: player.player_photo || "",
    });
    setImagePreview(player.player_photo || null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPlayerToEdit(null);
    setImagePreview(null);
  };

  const handleSaveChanges = () => {
    if (
      !editablePlayer.name ||
      !editablePlayer.number ||
      !editablePlayer.position
    ) {
      Alert.alert("Error", "Nombre, número y posición son campos obligatorios");
      return;
    }

    updatePlayer({
      id: playerToEdit._id,
      name: editablePlayer.name,
      number: parseInt(editablePlayer.number),
      position: editablePlayer.position,
      height: editablePlayer.height ? parseInt(editablePlayer.height) : null,
      weight: editablePlayer.weight ? parseInt(editablePlayer.weight) : null,
      player_photo: editablePlayer.player_photo,
    });
  };

  // Función para seleccionar una imagen
  const pickImage = async () => {
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
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Data = result.assets[0].base64;

      // Verificar el tamaño de la imagen (limitar a 1MB)
      if (base64Data.length > 1000000) {
        Alert.alert(
          "Image too large",
          "Please select a smaller image or use lower quality photos (under 1MB)."
        );
        return;
      }

      // Extraer la extensión para el tipo MIME
      let fileExtension = "png";
      try {
        const match = result.assets[0].uri.match(/\.([a-zA-Z0-9]+)$/);
        if (match && match[1]) {
          fileExtension = match[1].toLowerCase();
        }
      } catch (error) {
        console.log("Error extracting file extension:", error);
      }

      // Crear URL base64 con formato adecuado
      const imageUri = `data:image/${fileExtension};base64,${base64Data}`;
      setEditablePlayer({
        ...editablePlayer,
        player_photo: imageUri,
      });
      setImagePreview(result.assets[0].uri);
    }
  };

  const renderPlayerItem = ({ item }) => {
    // Si este jugador está siendo editado, mostrar el formulario de edición
    if (isEditing && playerToEdit && playerToEdit._id === item._id) {
      return (
        <View style={styles.playerCard}>
          {/* Área para la foto */}
          <TouchableOpacity onPress={pickImage} style={styles.photoEditArea}>
            {imagePreview ? (
              <Image
                source={{ uri: imagePreview }}
                style={styles.playerPhotoEdit}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={30} color="#FFA500" />
              </View>
            )}
            <Text style={styles.photoEditText}>Tap to change photo</Text>
          </TouchableOpacity>

          <View style={styles.playerEditForm}>
            <TextInput
              style={styles.playerEditInput}
              value={editablePlayer.name}
              onChangeText={(text) =>
                setEditablePlayer((prev) => ({ ...prev, name: text }))
              }
              placeholder="Nombre"
            />
            <TextInput
              style={styles.playerEditInput}
              value={editablePlayer.number}
              onChangeText={(text) =>
                setEditablePlayer((prev) => ({ ...prev, number: text }))
              }
              placeholder="Número"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.playerEditInput}
              value={editablePlayer.position}
              onChangeText={(text) =>
                setEditablePlayer((prev) => ({ ...prev, position: text }))
              }
              placeholder="Posición"
            />
            <View style={styles.playerEditRow}>
              <TextInput
                style={[styles.playerEditInput, { flex: 1, marginRight: 5 }]}
                value={editablePlayer.height}
                onChangeText={(text) =>
                  setEditablePlayer((prev) => ({ ...prev, height: text }))
                }
                placeholder="Altura"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.playerEditInput, { flex: 1, marginLeft: 5 }]}
                value={editablePlayer.weight}
                onChangeText={(text) =>
                  setEditablePlayer((prev) => ({ ...prev, weight: text }))
                }
                placeholder="Peso"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveChanges}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text style={styles.editButtonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={handleCancelEdit}
                disabled={isUpdating}
              >
                <Ionicons name="close-outline" size={20} color="white" />
                <Text style={styles.editButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Vista normal del jugador
    return (
      <View style={styles.playerCard}>
        {/* Botón de eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePlayer(item._id)}
          disabled={isDeleting || isEditing}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>

        {/* Botón de editar */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditPlayer(item)}
          disabled={isEditing}
        >
          <Ionicons name="create-outline" size={24} color="#FFA500" />
        </TouchableOpacity>

        {item.player_photo ? (
          <Image
            source={{ uri: item.player_photo }}
            style={styles.playerPhoto}
          />
        ) : (
          <View style={styles.playerNumber}>
            <Text style={styles.numberText}>#{item.number || "0"}</Text>
          </View>
        )}
        <View style={styles.playerInfo}>
          <View style={styles.nameNumberContainer}>
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.playerNumberText}>#{item.number || "0"}</Text>
          </View>
          <Text style={styles.playerPosition}>
            {item.position || "No position"}
          </Text>
          <Text style={styles.playerDetails}>
            Height: {item.height || "N/A"} • Weight: {item.weight || "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  const isLoading = isTeamLoading || isPlayersLoading;
  const isError = isTeamError || isPlayersError;
  const errorMessage = teamError?.message || playersError?.message;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando jugadores...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          {errorMessage || "Error al cargar datos"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetchPlayers()}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Usar SubpageTitle en lugar de Text */}
      <SubpageTitle>
        {team ? `${team.name} Players` : "Team Players"}
      </SubpageTitle>

      {players.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No players in this team yet</Text>
          <Text style={styles.emptySubtext}>
            Add players to start tracking their stats
          </Text>
        </View>
      ) : (
        <FlatList
          data={players}
          renderItem={renderPlayerItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Botón para añadir jugador */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New Player</Text>
      </TouchableOpacity>

      {/* Modal de confirmación */}
      <ConfirmModal
        visible={modalVisible}
        title="Confirmar eliminación"
        message="¿Estás seguro que deseas eliminar este jugador? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => {
          setModalVisible(false);
          setPlayerToDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 80, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
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
  listContainer: {
    paddingHorizontal: 200,
    paddingBottom: 90, 
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
    position: "relative", 
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 10, 
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 50, 
    zIndex: 10,
    padding: 10,
  },
  playerNumber: {
    backgroundColor: "#FFA500",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  numberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 3,
  },
  playerPosition: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  playerDetails: {
    fontSize: 14,
    color: "#888",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  playerPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  nameNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  playerNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6200",
    marginLeft: 8,
  },
  playerEditForm: {
    flex: 1,
    padding: 10,
  },
  playerEditInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FFA500",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  playerEditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 15,
    flex: 1,
    justifyContent: "center",
    marginRight: 5,
  },
  cancelEditButton: {
    backgroundColor: "#999",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 15,
    flex: 1,
    justifyContent: "center",
    marginLeft: 5,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  photoEditArea: {
    width: 100,
    alignItems: "center",
    marginRight: 10,
  },
  playerPhotoEdit: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6E0CE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  photoEditText: {
    fontSize: 12,
    color: "#FFA500",
    textAlign: "center",
  },
});