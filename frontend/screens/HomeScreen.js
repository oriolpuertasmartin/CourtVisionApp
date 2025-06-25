import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import { useDeviceType } from "../components/ResponsiveUtils";
import { scale, conditionalScale } from "../utils/responsive";
import API_BASE_URL from "../config/apiConfig";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const navigation = useNavigation();
  const deviceType = useDeviceType();
  const [user, setUser] = useState(null);

  // For responsive design
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 768;
  const isSmallScreen = screenWidth < 480;

  // Update dimensions when screen size changes
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

  // Load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
      }
    };

    loadUser();
  }, []);

  // Get recent teams data for the user
  const { data: recentTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["recent-teams", user?._id],
    queryFn: async () => {
      if (!user || !user._id) return [];

      const response = await fetch(
        `${API_BASE_URL}/teams/user/${user._id}?limit=3`
      );
      if (!response.ok) {
        throw new Error(`Error getting teams: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!user?._id,
  });

  // Get recent matches data - CORREGIDO: Cambiada la URL para usar el formato correcto
  const { data: recentMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["recent-matches", user?._id],
    queryFn: async () => {
      if (!user || !user._id) return [];

      // URL corregida para usar el formato de query params
      const response = await fetch(
        `${API_BASE_URL}/matches?userId=${user._id}&limit=3`
      );
      if (!response.ok) {
        throw new Error(`Error getting matches: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!user?._id,
  });

  // Calculate card dimensions based on screen size
  const getCardWidth = () => {
    if (isLargeScreen) return (screenWidth * 0.85) / 3 - 20;
    if (screenWidth > 480) return (screenWidth * 0.9) / 2 - 15;
    return screenWidth * 0.85;
  };

  // Render feature card
  const FeatureCard = ({
    icon,
    title,
    description,
    onPress,
    color = "#FFA500",
  }) => {
    const cardWidth = getCardWidth();

    return (
      <TouchableOpacity
        style={[
          styles.featureCard,
          {
            width: cardWidth,
            backgroundColor: `${color}10`,
            borderColor: color,
          },
        ]}
        onPress={onPress}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons
            name={icon}
            size={conditionalScale(24, {
              desktop: 30,
              tablet: 28,
              phone: 26,
              smallPhone: 22,
            })}
            color="white"
          />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </TouchableOpacity>
    );
  };

  // Render team or match card
  const ItemCard = ({ item, type = "team", onPress }) => {
    const cardWidth = getCardWidth() * 0.95;

    return (
      <TouchableOpacity
        style={[styles.itemCard, { width: cardWidth }]}
        onPress={onPress}
      >
        {type === "team" ? (
          <>
            {item.team_photo ? (
              <Image
                source={{ uri: item.team_photo }}
                style={styles.itemImage}
              />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Text style={styles.placeholderText}>
                  {item.name?.substring(0, 2).toUpperCase() || "T"}
                </Text>
              </View>
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.name || "Team"}</Text>
              <Text style={styles.itemSubtitle}>
                {item.category || "No category"}
              </Text>
              <Text style={styles.itemStats}>
                {item.playerCount || 0} players
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.matchCard}>
              <View style={styles.matchTeams}>
                <Text style={styles.matchTeamName}>
                  {item.teamName || "Your Team"}
                </Text>
                <Text style={styles.matchScore}>
                  {item.teamScore || "0"} - {item.opponentScore || "0"}
                </Text>
                <Text style={styles.matchTeamName}>
                  {item.opponentTeam?.name || "Opponent"}
                </Text>
              </View>
              <Text style={styles.matchDate}>
                {item.date
                  ? new Date(item.date).toLocaleDateString()
                  : "No date"}
              </Text>
              <View
                style={[
                  styles.matchStatusBadge,
                  {
                    backgroundColor:
                      item.status === "completed" ? "#4CAF50" : "#FFC107",
                  },
                ]}
              >
                <Text style={styles.matchStatusText}>
                  {item.status === "completed" ? "Completed" : "In progress"}
                </Text>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome section with solid color background */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeOverlay}>
            <Text style={styles.welcomeText}>
              Welcome back{user ? `, ${user.name?.split(" ")[0]}` : ""}!
            </Text>
            <Text style={styles.welcomeSubtext}>
              Track and analyze your basketball team's performance
            </Text>
          </View>
        </View>

        {/* Nueva sección dividida en dos columnas */}
        <View
          style={[
            styles.twoColumnContainer,
            { flexDirection: isLargeScreen ? "row" : "column" },
          ]}
        >
          {/* Columna izquierda - Quick Actions */}
          <View
            style={[
              styles.columnContainer,
              {
                width: isLargeScreen ? "48%" : "100%",
                marginBottom: isLargeScreen ? 0 : 25,
                flex: 1,
              },
            ]}
          >
            <Text style={styles.columnTitle}>Quick Actions</Text>
            <View style={styles.columnContent}>
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: "#EB840B20" },
                ]}
                onPress={() => navigation.navigate("Start a Match")}
              >
                <Ionicons name="basketball-outline" size={28} color="#EB840B" />
                <Text style={styles.quickActionText}>Start Match</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: "#4A90E220" },
                ]}
                onPress={() => navigation.navigate("Teams")}
              >
                <Ionicons name="people-outline" size={28} color="#4A90E2" />
                <Text style={styles.quickActionText}>Teams</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: "#50C87820" },
                ]}
                onPress={() => navigation.navigate("Info")}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={28}
                  color="#50C878"
                />
                <Text style={styles.quickActionText}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Columna derecha - News */}
          <View
            style={[
              styles.columnContainer,
              {
                width: isLargeScreen ? "48%" : "100%",
                marginBottom: isLargeScreen ? 0 : 25,
                flex: 1,
                marginLeft: isLargeScreen ? 20 : 0,
              },
            ]}
          >
            <Text style={styles.columnTitle}>News</Text>
            <View style={styles.columnContent}>
              <View style={styles.newsItem}>
                <Text style={styles.newsDate}>Yesterday</Text>
                <Text style={styles.newsTitle}>Performance improvements</Text>
                <Text style={styles.newsDescription}>
                  We've made the app faster and more reliable. Now you can also add photos for both teams and players!
                </Text>
              </View>

              <View style={styles.newsItem}>
                <Text style={styles.newsDate}>Coming soon</Text>
                <Text style={styles.newsTitle}>Player customization & historical stats</Text>
                <Text style={styles.newsDescription}>
                  Soon you'll be able to personalize player profiles and view
                  each player's historical statistics for the season.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    flex: 1,
  },
  scrollView: {
    width: "100%",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 50,
    flexGrow: 1,
  },
  welcomeContainer: {
    width: "100%",
    height: 180,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EB840B",
    borderRadius: 20,
    shadowColor: "#CCCCCC",
    shadowOffset: { width: 0, height: 2 },
    alignSelf: "center",
  },
  welcomeOverlay: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  twoColumnContainer: {
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 25,
    flex: 1,
  },
  columnContainer: {
    backgroundColor: "#EAEAEA", // Gris un poco más oscuro
    borderRadius: 15,
    padding: 15,
    elevation: 1,
    shadowColor: "#CCCCCC",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    flex: 1,
    minHeight: 400,
  },
  columnTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  columnContent: {
    flex: 1,
    justifyContent: "space-between", // Distribuir elementos uniformemente
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 28, // Botones mucho más grandes
    borderRadius: 12,
    marginBottom: 20, // Más espacio entre botones
    paddingHorizontal: 20, // Más padding horizontal
    height: "27%", // Altura fija para ocupar el espacio disponible
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    marginLeft: 15,
    fontSize: 20, // Texto más grande
    color: "#333",
    fontWeight: "500",
  },
  newsItem: {
    marginBottom: 20, // Más espacio entre noticias
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    flex: 1, // Para que ocupen espacio proporcional
  },
  newsDate: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 18, // Título más grande
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 15, // Descripción más grande
    color: "#666",
  },
  featureCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#999",
  },
  itemDetails: {
    marginTop: 5,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemStats: {
    fontSize: 14,
    color: "#888",
  },
  matchCard: {
    width: "100%",
  },
  matchTeams: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  matchTeamName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  matchScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 10,
  },
  matchDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  matchStatusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  matchStatusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
});
