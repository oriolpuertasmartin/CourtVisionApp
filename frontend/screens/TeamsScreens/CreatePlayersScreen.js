import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

export default function CreatePlayersScreen({ route, navigation }) {
  const { teamId } = route.params;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    position: "",
    height: "",
    weight: "",
    age: "",
    nationality: "",
    player_photo: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

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
      quality: 0.2, // Reduced quality (0.2 = 20% quality)
      base64: true,
    });

    if (!result.cancelled && result.assets && result.assets[0]) {
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
      setFormData({
        ...formData,
        player_photo: imageUri,
      });
      setImagePreview(result.assets[0].uri);
    }
  };

  // Consulta para obtener datos del equipo
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!teamId) return null;

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!teamId,
    onError: (error) => {
      Alert.alert("Error", "Failed to load team data");
      navigation.goBack();
    },
  });

  // Consulta para obtener jugadores del equipo
  const {
    data: players = [],
    isLoading: isPlayersLoading,
    isError: isPlayersError,
    refetch: refetchPlayers,
  } = useQuery({
    queryKey: ["players", "team", teamId],
    queryFn: async () => {
      if (!teamId) return [];

      try {
        const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
        if (!response.ok) {
          console.error(`Error obteniendo jugadores: ${response.status}`);
          // Si es un 404, podríamos asumir que es un equipo nuevo sin jugadores
          if (response.status === 404) {
            return [];
          }
          throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error completo:", error);
        // Si es un equipo nuevo, es normal que no tenga jugadores todavía
        return [];
      }
    },
    enabled: !!teamId,
    retry: 3, // Aumentar el número de reintentos
    retryDelay: 1000, // Esperar 1 segundo entre reintentos
  });

  // Mutation para añadir un jugador
  const { mutate: addPlayer, isPending: isAdding } = useMutation({
    mutationFn: async (playerData) => {
      console.log("Intentando crear jugador con datos:", playerData);

      const response = await fetch(`${API_BASE_URL}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        console.error("Error al crear jugador:", response.status);
        const errorData = await response.text();
        console.error("Detalles del error:", errorData);
        throw new Error(`Error creating player: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: (newPlayer) => {
      console.log("Jugador creado exitosamente:", newPlayer);
      setFormData({
        name: "",
        number: "",
        position: "",
        height: "",
        weight: "",
        age: "",
        nationality: "",
        player_photo: "",
      });
      setImagePreview(null);

      // Actualizar caché de React Query
      queryClient.invalidateQueries({ queryKey: ["players", "team", teamId] });

      Alert.alert("Success", "Player added successfully!");
    },
    onError: (error) => {
      console.error("Error en la mutación:", error);
      Alert.alert("Error", `Failed to add player: ${error.message}`);
    },
  });

  const handleAddPlayer = () => {
    // Comprobamos que no se sobrepasa el limite de jugadores maximo
    if (players && players.length >= 15) {
      Alert.alert(
        "Límite de jugadores alcanzado",
        "No puedes añadir más de 15 jugadores a un equipo.",
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }

    // Validar campos obligatorios
    if (!formData.name || !formData.number || !formData.position) {
      Alert.alert(
        "Error",
        "Please fill in the required fields: Name, Number, and Position"
      );
      return;
    }

    // Validar que el número sea un entero positivo
    if (isNaN(parseInt(formData.number)) || parseInt(formData.number) <= 0) {
      Alert.alert("Error", "Player number must be a positive integer");
      return;
    }

    // Verificar si ya existe un jugador con el mismo número
    const existingPlayerWithNumber = players.find(
      player => player.number === parseInt(formData.number)
    );
    
    if (existingPlayerWithNumber) {
      Alert.alert(
        "Número duplicado", 
        `Ya existe un jugador con el número ${formData.number}. Por favor, usa otro número.`
      );
      return;
    }

    // Ejecutar la mutación
    addPlayer({
      name: formData.name,
      number: parseInt(formData.number),
      position: formData.position,
      height: formData.height ? parseInt(formData.height) : null,
      weight: formData.weight ? parseInt(formData.weight) : null,
      age: formData.age ? parseInt(formData.age) : null,
      nationality: formData.nationality || "",
      player_photo: formData.player_photo || "",
      team_id: teamId,
    });
  };

  const handleFinish = () => {
    // Invalidar la caché de equipos para forzar una recarga de datos
    queryClient.invalidateQueries({ queryKey: ["teams"] });

    // Navegar correctamente según la estructura de tu navegación
    try {
      // Primero intentamos con navegación anidada
      navigation.navigate("Teams", {
        screen: "TeamsList",
        params: { refresh: true },
      });
    } catch (error) {
      // Si falla, intentamos navegar directamente al Stack de Teams
      try {
        navigation.navigate("TeamsList", { refresh: true });
      } catch (innerError) {
        // Si todo falla, simplemente volvemos atrás
        navigation.goBack();
      }
    }
  };

  const isLoading = isTeamLoading || isPlayersLoading;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Loading team data...</Text>
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

      <Text style={styles.headerTitle}>
        {team ? `Add Players to ${team.name}` : "Add Players"}
      </Text>

      {/* ScrollView para hacer todo el contenido desplazable */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Lista de jugadores existentes */}
        {players.length > 0 && (
          <View style={styles.playersListContainer}>
            <Text style={styles.listTitle}>
              Team Players ({players.length}/15)
            </Text>
            <View style={styles.playersGrid}>
              {players.map((player) => (
                <TouchableOpacity
                  key={player._id}
                  style={styles.playerChip}
                  onPress={() =>
                    Alert.alert(
                      `${player.name}`,
                      `Position: ${player.position}\nNumber: ${player.number}`
                    )
                  }
                >
                  <Text style={styles.playerChipNumber}>#{player.number}</Text>
                  <Text style={styles.playerChipName}>{player.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Sección para subir imagen */}
        <View style={styles.whiteBox}>
          <Text style={styles.sectionTitle}>Player Photo</Text>
          <View style={styles.imageSection}>
            {imagePreview ? (
              <Image
                source={{ uri: imagePreview }}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person-outline" size={40} color="#FFA500" />
                <Text style={styles.imagePlaceholderText}>Player Photo</Text>
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={20} color="white" />
              <Text style={styles.uploadButtonText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulario para añadir jugador */}
        <BoxFill
          title="Player Information"
          fields={[
            { name: "name", placeholder: "Name *", required: true },
            {
              name: "number",
              placeholder: "Number *",
              keyboardType: "numeric",
              required: true,
            },
            { name: "position", placeholder: "Position *", required: true },
            {
              name: "height",
              placeholder: "Height (cm)",
              keyboardType: "numeric",
            },
            {
              name: "weight",
              placeholder: "Weight (kg)",
              keyboardType: "numeric",
            },
            { name: "age", placeholder: "Age", keyboardType: "numeric" },
            { name: "nationality", placeholder: "Nationality" },
          ]}
          formData={formData}
          onChangeForm={setFormData}
        >
          <Text style={styles.infoText}>
            {players.length < 15 
              ? `Puedes añadir ${15 - players.length} jugadores más` 
              : "Límite de jugadores alcanzado (15/15)"}
          </Text>
          
          <PrimaryButton
            title={isAdding ? "Adding..." : "Add Player"}
            onPress={handleAddPlayer}
            style={[
              styles.addButton,
              players.length >= 15 && styles.disabledButton
            ]}
            disabled={isAdding || players.length >= 15}
          />
          <PrimaryButton
            title="Finish"
            onPress={handleFinish}
            style={styles.finishButton}
            disabled={isAdding}
          />
        </BoxFill>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
    paddingTop: 50,
    alignItems: "center",
  },
  scrollContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 30, // Extra padding at the bottom for safe scrolling
  },
  loadingContainer: {
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
    textAlign: "center",
  },
  playersListContainer: {
    width: "90%",
    maxHeight: 200,
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  playersList: {
    maxHeight: 150,
  },
  whiteBox: {
    width: "70%",
    backgroundColor: "#FFF9E7",
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  imageSection: {
    alignItems: "center",
    width: "100%",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E6E0CE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePlaceholderText: {
    marginTop: 5,
    color: "#FFA500",
    fontWeight: "bold",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 5,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  playersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  playerChip: {
    backgroundColor: "#E6E0CE",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  playerChipNumber: {
    fontWeight: "bold",
    marginRight: 5,
    color: "#FFA500",
  },
  playerChipName: {
    fontSize: 14,
  },
  playerItem: {
    backgroundColor: "#E6E0CE",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  playerNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 15,
    minWidth: 40,
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
  addButton: {
    backgroundColor: "#FFA500",
    marginTop: 10,
  },
  finishButton: {
    backgroundColor: "#28a745",
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
});