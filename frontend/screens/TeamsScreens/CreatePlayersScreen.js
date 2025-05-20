import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SubpageTitle from "../../components/SubpageTitle";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";
import ImageUploader from "../../components/ImageUploader";

export default function CreatePlayersScreen({ route, navigation }) {
  const { teamId } = route.params;
  const queryClient = useQueryClient();
  const deviceType = useDeviceType();

  // Para detectar el tamaño de la pantalla y ajustar el layout
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const isLargeScreen = screenWidth > 768;

  // Actualizar dimensiones cuando cambie el tamaño de la pantalla
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    const subscription = Dimensions.addEventListener("change", updateDimensions);
    return () => subscription.remove();
  }, []);

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
          if (response.status === 404) {
            return [];
          }
          throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error completo:", error);
        return [];
      }
    },
    enabled: !!teamId,
    retry: 3,
    retryDelay: 1000,
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

      // Actualizar caché de React Query y recargar jugadores
      queryClient.invalidateQueries({ queryKey: ["players", "team", teamId] });
      refetchPlayers();

      Alert.alert("Success", "Player added successfully!");
    },
    onError: (error) => {
      console.error("Error en la mutación:", error);
      Alert.alert("Error", `Failed to add player: ${error.message}`);
    },
  });

  const handleAddPlayer = () => {
    if (players && players.length >= 13) {
      Alert.alert(
        "Límite de jugadores alcanzado",
        "No puedes añadir más de 13 jugadores a un equipo.",
        [{ text: "Entendido", style: "default" }]
      );
      return;
    }

    if (!formData.name || !formData.number || !formData.position) {
      Alert.alert(
        "Error",
        "Please fill in the required fields: Name, Number, and Position"
      );
      return;
    }

    if (isNaN(parseInt(formData.number)) || parseInt(formData.number) <= 0) {
      Alert.alert("Error", "Player number must be a positive integer");
      return;
    }

    const existingPlayerWithNumber = players.find(
      (player) => player.number === parseInt(formData.number)
    );

    if (existingPlayerWithNumber) {
      Alert.alert(
        "Número duplicado",
        `Ya existe un jugador con el número ${formData.number}. Por favor, usa otro número.`
      );
      return;
    }

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
    queryClient.invalidateQueries({ queryKey: ["teams"] });

    try {
      navigation.navigate("Teams", {
        screen: "TeamsList",
        params: { refresh: true },
      });
    } catch (error) {
      try {
        navigation.navigate("TeamsList", { refresh: true });
      } catch (innerError) {
        navigation.goBack();
      }
    }
  };

  const renderPlayersList = () => (
    <View style={styles.playersListContainer}>
      <Text style={styles.playersListTitle}>Current Players</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item._id}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.playerNumber}>#{item.number}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const renderPlayerForm = () => (
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
      <ImageUploader
        label="Player Photo"
        imagePreview={imagePreview}
        onImageSelected={(imageUri) =>
          setFormData({ ...formData, player_photo: imageUri })
        }
        size={120}
        containerStyle={{
          width: "100%",
          backgroundColor: "#FFF9E7",
          borderRadius: 12,
          padding: 10,
          marginVertical: 10,
          alignItems: "center",
        }}
      />

      <Text style={styles.helperText}>
        {players.length < 13
          ? `Puedes añadir ${13 - players.length} jugadores más`
          : "Límite de jugadores alcanzado (13/13)"}
      </Text>

      <PrimaryButton
        title={isAdding ? "Adding..." : "Add Player"}
        onPress={handleAddPlayer}
        style={[
          styles.addButton,
          players.length >= 13 && styles.disabledButton,
        ]}
        disabled={isAdding || players.length >= 13}
      />
      <PrimaryButton
        title="Finish"
        onPress={handleFinish}
        style={styles.finishButton}
        disabled={isAdding}
      />
    </BoxFill>
  );

  const isLoading = isTeamLoading || isPlayersLoading;

  if (isLoading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
        scrollable={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Loading team data...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
      scrollable={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <SubpageTitle>
        {team ? `Add Players to ${team.name}` : "Add Players"}
      </SubpageTitle>

      {renderPlayersList()}

      <View style={styles.content}>{renderPlayerForm()}</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    padding: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  playersListContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  playersListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  playerCard: {
    backgroundColor: "#FFF9E7",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    alignItems: "center",
  },
  playerName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  playerNumber: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#FFA500",
    marginTop: 10,
  },
  finishButton: {
    backgroundColor: "#28a745",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
});