import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import SubpageTitle from "../../components/SubpageTitle";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function CreatePlayersScreen({ route, navigation }) {
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
    if (players && players.length >= 13) {
      Alert.alert(
        "Límite de jugadores alcanzado",
        "No puedes añadir más de 13 jugadores a un equipo.",
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

  // Renderizar componente de lista de jugadores existentes
  const renderPlayersList = () => (
    players.length > 0 ? (
      <View style={{
        width: screenWidth < 480 ? "95%" : "90%",
        maxHeight: screenWidth < 480 ? 150 : 200,
        marginBottom: screenWidth < 480 ? 10 : 20,
      }}>
        <Text style={{
          fontSize: screenWidth < 480 ? 16 : 18,
          fontWeight: "bold",
          marginBottom: 10,
        }}>
          Team Players ({players.length}/13)
        </Text>
        <View style={styles.playersGrid}>
          {players.map((player) => (
            <TouchableOpacity
              key={player._id}
              style={{
                backgroundColor: "#E6E0CE",
                borderRadius: 20,
                paddingVertical: screenWidth < 480 ? 6 : 8,
                paddingHorizontal: screenWidth < 480 ? 10 : 12,
                margin: screenWidth < 480 ? 3 : 5,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() =>
                Alert.alert(
                  `${player.name}`,
                  `Position: ${player.position}\nNumber: ${player.number}`
                )
              }
            >
              <Text style={{
                fontWeight: "bold",
                marginRight: 5,
                color: "#FFA500",
                fontSize: screenWidth < 480 ? 12 : 14,
              }}>#{player.number}</Text>
              <Text style={{
                fontSize: screenWidth < 480 ? 12 : 14,
              }}>{player.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ) : null
  );

  // Renderizar componente para subir imagen
  const renderImageUploader = () => (
    <View style={{
      width: screenWidth < 480 ? "90%" : (screenWidth < 768 ? "80%" : "70%"),
      backgroundColor: "#FFF9E7",
      borderRadius: 12,
      padding: screenWidth < 480 ? 15 : 20,
      marginVertical: screenWidth < 480 ? 10 : 15,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }}>
      <Text style={{
        fontSize: screenWidth < 480 ? 14 : 16,
        fontWeight: "bold",
        marginBottom: screenWidth < 480 ? 10 : 15,
        textAlign: "center",
        color: "#333",
      }}>Player Photo</Text>
      <View style={styles.imageSection}>
        {imagePreview ? (
          <Image
            source={{ uri: imagePreview }}
            style={{
              width: screenWidth < 480 ? 90 : 120,
              height: screenWidth < 480 ? 90 : 120,
              borderRadius: screenWidth < 480 ? 45 : 60,
              marginBottom: 10,
              borderWidth: 2,
              borderColor: "#FFA500",
            }}
          />
        ) : (
          <View style={{
            width: screenWidth < 480 ? 90 : 120,
            height: screenWidth < 480 ? 90 : 120,
            borderRadius: screenWidth < 480 ? 45 : 60,
            backgroundColor: "#E6E0CE",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}>
            <Ionicons name="person-outline" size={40} color="#FFA500" />
            <Text style={{
              marginTop: 5,
              color: "#FFA500",
              fontWeight: "bold",
              fontSize: screenWidth < 480 ? 12 : 14,
            }}>Player Photo</Text>
          </View>
        )}
        <TouchableOpacity 
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFA500",
            paddingVertical: screenWidth < 480 ? 6 : 8,
            paddingHorizontal: screenWidth < 480 ? 12 : 15,
            borderRadius: 20,
            marginTop: 5,
          }} 
          onPress={pickImage}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="white" />
          <Text style={{
            color: "white",
            fontWeight: "bold",
            marginLeft: 5,
            fontSize: screenWidth < 480 ? 12 : 14,
          }}>Upload Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar componente del formulario
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
      <Text style={{
        fontSize: screenWidth < 480 ? 12 : 14,
        color: "#666",
        marginTop: 5,
        textAlign: "center",
      }}>
        {players.length < 13 
          ? `Puedes añadir ${13 - players.length} jugadores más` 
          : "Límite de jugadores alcanzado (13/13)"}
      </Text>
      
      <PrimaryButton
        title={isAdding ? "Adding..." : "Add Player"}
        onPress={handleAddPlayer}
        style={[
          styles.addButton,
          players.length >= 13 && styles.disabledButton
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

  // Renderizar todos los elementos del formulario como un solo componente
  const renderFormContent = () => (
    <View style={styles.formContentContainer}>
      {renderPlayersList()}
      {renderImageUploader()}
      {renderPlayerForm()}
    </View>
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
      {/* Botón para volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Usar SubpageTitle en lugar de Text normal */}
      <SubpageTitle>
        {team ? `Add Players to ${team.name}` : "Add Players"}
      </SubpageTitle>

      <View style={styles.content}>
        {/* Usar FlatList en lugar de ScrollView para evitar anidamiento de listas virtualizadas */}
        <FlatList
          data={[{ key: 'formSection' }]}
          renderItem={() => renderFormContent()}
          keyExtractor={item => item.key}
          contentContainerStyle={[
            styles.listContainer,
            isLargeScreen ? { paddingHorizontal: 100 } : { paddingHorizontal: 0 }
          ]}
          showsVerticalScrollIndicator={true}
          bounces={true}
        />
      </View>
    </ScreenContainer>
  );
}

// Estos son los estilos que no dependen de screenWidth
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
  formContentContainer: {
    width: "100%",
    alignItems: "center",
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
  listContainer: {
    paddingBottom: 30,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40, 
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  playersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  imageSection: {
    alignItems: "center",
    width: "100%",
  },
  playerInfo: {
    flex: 1,
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