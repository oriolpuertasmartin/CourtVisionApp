import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import PrimaryButton from "../../components/PrimaryButton";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery, useMutation } from "@tanstack/react-query";
import ScreenContainer from "../../components/ScreenContainer";
import { useDeviceType } from "../../components/ResponsiveUtils";
import ScreenHeader from "../../components/ScreenHeader";
import { scale, conditionalScale, getDeviceType } from "../../utils/responsive";

export default function StartingPlayers({ route, navigation }) {
  const { teamId: routeTeamId, updatedMatch } = route.params;
  const teamId = routeTeamId || updatedMatch?.teamId;
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const deviceType = useDeviceType();

  // Para detectar el tamaño de la pantalla y ajustar el layout
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 768;
  const isSmallScreen = screenWidth < 480;
  const isVerySmallScreen = screenWidth < 360;

  // Actualizar dimensiones cuando cambie el tamaño de la pantalla
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    return () => subscription.remove();
  }, []);

  // Consulta para obtener jugadores del equipo
  const {
    data: players = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["players", "team", teamId],
    queryFn: async () => {
      if (!teamId) {
        throw new Error("No se proporcionó un teamId válido");
      }

      const response = await fetch(`${API_BASE_URL}/players/team/${teamId}`);
      if (!response.ok) {
        throw new Error(`Error al obtener los jugadores: ${response.status}`);
      }

      return await response.json();
    },
    enabled: !!teamId,
  });

  // Mutación para actualizar los jugadores titulares y crear estadísticas iniciales
  const { mutate: startMatch, isPending } = useMutation({
    mutationFn: async () => {
      // Paso 1: Actualizar los jugadores titulares
      const updateResponse = await fetch(
        `${API_BASE_URL}/matches/${updatedMatch._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startingPlayers: selectedPlayers }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Error al guardar los jugadores titulares");
      }

      const updatedMatchData = await updateResponse.json();

      // Paso 2: Obtener todos los jugadores del equipo
      const playersResponse = await fetch(
        `${API_BASE_URL}/players/team/${teamId}`
      );
      if (!playersResponse.ok) {
        throw new Error("Error al obtener los jugadores del equipo");
      }

      const allPlayers = await playersResponse.json();
      const allPlayerIds = allPlayers.map((player) => player._id);

      // Paso 3: Inicializar estadísticas de todos los jugadores y el oponente
      const statsResponse = await fetch(`${API_BASE_URL}/playerstats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: updatedMatch._id,
          playerIds: allPlayerIds,
        }),
      });

      if (!statsResponse.ok) {
        throw new Error("Error al inicializar las estadísticas");
      }

      // Paso 4: Inicializar estadísticas del oponente
      const opponentStatsResponse = await fetch(`${API_BASE_URL}/playerstats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: updatedMatch._id,
          playerIds: ["opponent"],
        }),
      });

      if (!opponentStatsResponse.ok) {
        throw new Error("Error al inicializar las estadísticas del oponente");
      }

      return updatedMatchData;
    },
    onSuccess: (data) => {
      Alert.alert("Éxito", "Jugadores titulares guardados correctamente");
      navigation.navigate("StatsScreen", {
        selectedPlayers,
        matchId: updatedMatch._id,
        teamId,
      });
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        `No se pudieron guardar los jugadores titulares: ${error.message}`
      );
    },
  });

  const handleSelectPlayer = (player) => {
    if (selectedPlayers.includes(player._id)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== player._id));
    } else if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, player._id]);
    } else {
      Alert.alert("Límite alcanzado", "Solo puedes seleccionar 5 jugadores.");
    }
  };

  const handleStart = () => {
    if (selectedPlayers.length === 5) {
      startMatch();
    } else {
      Alert.alert(
        "Selección incompleta",
        "Por favor selecciona 5 jugadores para comenzar."
      );
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función para renderizar cada jugador con su foto/número y posición
  const renderPlayerItem = (player) => {
    const isSelected = selectedPlayers.includes(player._id);
    
    // Calcular tamaños de forma proporcional
    const photoSize = conditionalScale(60, {
      desktop: 80,
      tablet: 70, 
      phone: 60,
      smallPhone: 50
    });
    
    const numberCircleSize = conditionalScale(50, {
      desktop: 60, 
      tablet: 55,
      phone: 50,
      smallPhone: 40
    });
    
    const photoMargin = conditionalScale(15, {
      desktop: 30,
      tablet: 25,
      phone: 20, 
      smallPhone: 15
    });
    
    const numberMarginLeft = conditionalScale(10, {
      desktop: 20,
      tablet: 15,
      phone: 10,
      smallPhone: 5
    });

    return (
      <TouchableOpacity
        style={[
          styles.itemButton,
          isSelected && styles.selectedPlayerItem, // Aplicamos el estilo de selección al botón completo
          {
            paddingVertical: scale(8),
            borderRadius: scale(8)
          }
        ]}
        onPress={() => handleSelectPlayer(player)}
      >
        <View
          style={[
            styles.playerItemContainer,
            // Ya no aplicamos aquí el estilo de selección
            {
              paddingVertical: conditionalScale(8, {
                desktop: 12,
                tablet: 10,
                phone: 8,
                smallPhone: 6
              }),
              paddingHorizontal: conditionalScale(10, {
                desktop: 15,
                tablet: 12,
                phone: 10,
                smallPhone: 8
              })
            }
          ]}
        >
          {player.player_photo ? (
            <Image
              source={{ uri: player.player_photo }}
              style={[
                styles.playerPhoto,
                {
                  width: photoSize,
                  height: photoSize,
                  borderRadius: photoSize / 2,
                  marginRight: photoMargin,
                  marginLeft: numberMarginLeft
                }
              ]}
            />
          ) : (
            <View
              style={[
                styles.playerNumberCircle,
                {
                  width: numberCircleSize,
                  height: numberCircleSize,
                  borderRadius: numberCircleSize / 2,
                  marginRight: photoMargin,
                  marginLeft: numberMarginLeft
                }
              ]}
            >
              <Text
                style={[
                  styles.playerNumberText,
                  {
                    fontSize: conditionalScale(16, {
                      desktop: 22,
                      tablet: 20,
                      phone: 18,
                      smallPhone: 16
                    })
                  }
                ]}
              >
                {player.number || "0"}
              </Text>
            </View>
          )}
          <View style={styles.playerInfoContainer}>
            <Text
              style={[
                styles.playerName,
                {
                  fontSize: conditionalScale(16, {
                    desktop: 22,
                    tablet: 20,
                    phone: 18,
                    smallPhone: 16
                  }),
                  marginBottom: scale(3)
                }
              ]}
            >
              {player.name}
            </Text>
            <Text
              style={[
                styles.playerPosition,
                {
                  fontSize: conditionalScale(14, {
                    desktop: 17,
                    tablet: 16,
                    phone: 15,
                    smallPhone: 14
                  })
                }
              ]}
            >
              {player.position || "Sin posición"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={[
            styles.loadingText,
            {
              fontSize: conditionalScale(14, {
                desktop: 18,
                tablet: 16,
                phone: 14,
                smallPhone: 13
              }),
              marginTop: scale(15)
            }
          ]}>
            Cargando jugadores...
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
        <View style={styles.errorContainer}>
          <Text style={[
            styles.errorText,
            {
              fontSize: conditionalScale(14, {
                desktop: 18,
                tablet: 16,
                phone: 14,
                smallPhone: 12
              }),
              marginBottom: scale(20)
            }
          ]}>
            {error?.message || "Error al cargar jugadores"}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                paddingVertical: scale(12),
                paddingHorizontal: scale(25),
                borderRadius: scale(8)
              }
            ]}
            onPress={() => refetch()}
          >
            <Text style={[
              styles.retryButtonText,
              {
                fontSize: conditionalScale(14, {
                  desktop: 18,
                  tablet: 16,
                  phone: 14,
                  smallPhone: 12
                })
              }
            ]}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // Calcular dimensiones responsivas para el contenedor principal
  const getBoxWidth = () => {
    return conditionalScale('95%', {
      desktop: '70%',
      tablet: '80%',
      phone: '90%',
      smallPhone: '95%'
    });
  };

  const getBoxHeight = () => {
    return conditionalScale('55%', {
      desktop: '65%',
      tablet: '60%',
      phone: '55%',
      smallPhone: '55%'
    });
  };

  // Obtener el texto del botón apropiado para el tamaño de la pantalla
  const getButtonText = () => {
    if (isPending) return "Guardando...";
    
    // Para pantallas muy pequeñas, usar un texto más corto
    if (isVerySmallScreen) return "Iniciar";
    if (isSmallScreen) return "Iniciar partido";
    
    // Para pantallas más grandes, usar el texto completo
    return "Comenzar partido";
  };

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      <ScreenHeader
        title="Select the 5 starting players"
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
      />

      <View style={[
        styles.content,
        {
          padding: scale(20),
          paddingBottom: scale(20)
        }
      ]}>
        {/* Contador de jugadores seleccionados */}
        <Text style={[
          styles.selectionCounter,
          {
            fontSize: conditionalScale(16, {
              desktop: 22,
              tablet: 20,
              phone: 18,
              smallPhone: 16
            }),
            marginBottom: scale(15)
          }
        ]}>
          {selectedPlayers.length}/5 players selected
        </Text>

        <View
          style={[
            styles.boxSelectorContainer,
            { width: getBoxWidth() },
            { height: getBoxHeight() }
          ]}
        >
          <BoxSelector
            items={players}
            onSelect={handleSelectPlayer}
            emptyMessage="No hay jugadores disponibles. Crea jugadores primero."
            customRenderItem={renderPlayerItem}
          >
            {/* Reemplazo del PrimaryButton por un TouchableOpacity estilizado como en TeamsScreen */}
            <TouchableOpacity
              style={[
                styles.createButton,
                selectedPlayers.length !== 5 && styles.disabledButton,
                deviceType === 'desktop' && styles.createButtonDesktop
              ]}
              onPress={handleStart}
              disabled={selectedPlayers.length !== 5 || isPending}
            >
              <Text style={[
                styles.createButtonText,
                deviceType === 'desktop' && styles.createButtonTextDesktop
              ]}>
                {getButtonText()}
              </Text>
            </TouchableOpacity>
          </BoxSelector>
        </View>
      </View>

      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      )}
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
    flex: 1,
    alignItems: "center",
  },
  selectionCounter: {
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    flex: 1,
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FFA500",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  boxSelectorContainer: {
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  itemButton: {
    backgroundColor: "white",
    width: "100%",
    marginBottom: 8, // Agregamos un margen inferior para separar los elementos
    borderRadius: 8, // Aseguramos que el botón tenga bordes redondeados
  },
  selectedPlayerItem: {
    backgroundColor: "#FFF8E1", // Color de fondo para el elemento seleccionado
    borderWidth: 2,
    borderColor: "#FFA500", // Borde naranja para el elemento seleccionado
  },
  playerItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  playerPhoto: {
    borderWidth: 1,
    borderColor: "#E6E0CE",
  },
  playerNumberCircle: {
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
  },
  playerNumberText: {
    fontWeight: "bold",
    color: "white",
  },
  playerInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  playerName: {
    fontWeight: "bold",
  },
  playerPosition: {
    color: "#777",
  },
  // Nuevos estilos que reemplazan los del botón de inicio
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
  disabledButton: {
    backgroundColor: "#ccc",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});