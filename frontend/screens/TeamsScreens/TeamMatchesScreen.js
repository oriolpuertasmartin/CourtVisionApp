import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoxSelector from "../../components/BoxSelector";
import { useOrientation } from "../../components/OrientationHandler";
import API_BASE_URL from "../../config/apiConfig";
import { useQuery } from "@tanstack/react-query";
import ScreenContainer from "../../components/ScreenContainer";
import ScreenHeader from "../../components/ScreenHeader";
import { useDeviceType } from "../../components/ResponsiveUtils";

export default function TeamMatchesScreen({ route, navigation }) {
  const { teamId, userId } = route.params;
  const deviceType = useDeviceType();

  // To detect screen size and adjust layout
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const isLargeScreen = screenWidth > 768;
  const isSmallScreen = screenWidth < 480;
  const isDesktop = deviceType === 'desktop';

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

  // Use orientation hook
  const orientation = useOrientation();

  // Query to get team information
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
        throw new Error(`Error loading team: ${response.status}`);
      }
      return await response.json();
    },
    enabled: !!teamId,
  });

  // Query to get all matches
  const {
    data: allMatches = [],
    isLoading: isMatchesLoading,
    isError: isMatchesError,
    error: matchesError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/matches`);
      if (!response.ok) {
        throw new Error(`Error loading matches: ${response.status}`);
      }
      return await response.json();
    },
  });

  // Filter and format matches
  const formattedMatches = React.useMemo(() => {
    if (!allMatches.length || !team) return [];

    // Filter matches that belong to this team
    const teamMatches = allMatches
      .filter(
        (match) =>
          match.teamId === teamId ||
          (match.opponentTeam && match.opponentTeam._id === teamId)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

    // Format matches for BoxSelector
    return teamMatches.map((match) => {
      const matchDate = new Date(match.date).toLocaleDateString();
      const status = match.status === "completed" ? "Final" : "In progress";

      // Determine which team is home and which is away
      const isMyTeamA = match.teamId === teamId;
      
      return {
        _id: match._id,
        name: `${team?.name || "Team"} vs ${
          match.opponentTeam?.name || "Opponent"
        }`,
        subtitle: `${match.teamAScore || 0} - ${
          match.teamBScore || 0
        } • ${status} • ${matchDate}`,
        match: match, // Save full object for later use
        isMyTeamA: isMyTeamA,
        teamPhoto: team?.team_photo,
        opponentPhoto: match.opponentTeam?.photo
      };
    });
  }, [allMatches, team, teamId]);

  const handleSelectMatch = (match) => {
    navigation.navigate("StatsView", { matchId: match._id });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Function to render each match with logos
  const renderMatchItem = (item) => {
    // Logo size based on screen size - Increased sizes
    const logoSize = isSmallScreen ? 50 : isDesktop ? 90 : 70;
    
    // Determine which team is home and which is away
    const homeTeam = item.isMyTeamA ? team : item.match.opponentTeam;
    const awayTeam = item.isMyTeamA ? item.match.opponentTeam : team;
    
    const homeTeamName = homeTeam?.name || "Team";
    const awayTeamName = awayTeam?.name || "Opponent";
    
    const homeTeamScore = item.isMyTeamA ? (item.match.teamAScore || 0) : (item.match.teamBScore || 0);
    const awayTeamScore = item.isMyTeamA ? (item.match.teamBScore || 0) : (item.match.teamAScore || 0);
    
    const homeTeamPhoto = item.isMyTeamA ? item.teamPhoto : item.opponentPhoto;
    const awayTeamPhoto = item.isMyTeamA ? item.opponentPhoto : item.teamPhoto;
    
    const matchDate = new Date(item.match.date).toLocaleDateString();
    const status = item.match.status === "completed" ? "Final" : "In progress";
    
    // Ajuste del tamaño del contenedor según tipo de dispositivo - Increased sizes and padding
    const containerStyle = isDesktop 
      ? { maxWidth: '100%', alignSelf: 'center', width: '98%', padding: 30, marginBottom: 30 }
      : isLargeScreen 
        ? { maxWidth: '97%', alignSelf: 'center', width: '97%', padding: 25, marginBottom: 25 }
        : { width: '98%', padding: isSmallScreen ? 15 : 20, marginBottom: 20 };
    
    // Ajuste del tamaño de la fuente del puntaje según dispositivo - Increased font sizes
    const scoreTextSize = isDesktop ? 38 : isLargeScreen ? 32 : isSmallScreen ? 24 : 28;
    
    // Ajuste del tamaño de la fuente de los nombres según dispositivo - Increased font sizes
    const teamNameSize = isDesktop ? 24 : isLargeScreen ? 20 : isSmallScreen ? 16 : 18;
    
    // Máximo ancho para nombres de equipo según dispositivo - Increased max widths
    const teamNameMaxWidth = isDesktop ? 250 : isLargeScreen ? 220 : 150;
    
    return (
      <View style={[
        styles.matchItemContainer,
        containerStyle
      ]}>
        {/* Match date and status */}
        <Text style={[
          styles.matchDateText, 
          { fontSize: isDesktop ? 20 : isLargeScreen ? 18 : 16, marginBottom: 20 }
        ]}>
          {matchDate} • {status}
        </Text>
        
        <View style={[styles.matchTeamsRow, { marginBottom: 25 }]}>
          {/* Home Team */}
          <View style={styles.teamContainer}>
            {/* Home Team Logo */}
            <View style={[styles.logoContainer, { marginBottom: 15 }]}>
              {homeTeamPhoto ? (
                <Image
                  source={{ uri: homeTeamPhoto }}
                  style={[
                    styles.teamLogo, 
                    { width: logoSize, height: logoSize, borderRadius: logoSize/2 }
                  ]}
                />
              ) : (
                <View style={[
                  styles.logoPlaceholder, 
                  { 
                    width: logoSize, 
                    height: logoSize, 
                    borderRadius: logoSize/2 
                  }
                ]}>
                  <Text style={[
                    styles.logoPlaceholderText,
                    { fontSize: logoSize * 0.4 }
                  ]}>
                    {homeTeamName.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.teamName, 
              { 
                fontSize: teamNameSize,
                maxWidth: teamNameMaxWidth
              }
            ]} numberOfLines={1}>
              {homeTeamName}
            </Text>
          </View>
          
          {/* Score */}
          <View style={[
            styles.scoreContainer,
            { 
              paddingVertical: isDesktop ? 20 : isLargeScreen ? 16 : 12,
              paddingHorizontal: isDesktop ? 40 : isLargeScreen ? 35 : 25,
              minWidth: isDesktop ? 180 : isLargeScreen ? 160 : 120
            }
          ]}>
            <Text style={[styles.scoreText, { fontSize: scoreTextSize }]}>
              {homeTeamScore} - {awayTeamScore}
            </Text>
          </View>
          
          {/* Away Team */}
          <View style={styles.teamContainer}>
            {/* Away Team Logo */}
            <View style={[styles.logoContainer, { marginBottom: 15 }]}>
              {awayTeamPhoto ? (
                <Image
                  source={{ uri: awayTeamPhoto }}
                  style={[
                    styles.teamLogo, 
                    { width: logoSize, height: logoSize, borderRadius: logoSize/2 }
                  ]}
                />
              ) : (
                <View style={[
                  styles.logoPlaceholder, 
                  { 
                    width: logoSize, 
                    height: logoSize, 
                    borderRadius: logoSize/2 
                  }
                ]}>
                  <Text style={[
                    styles.logoPlaceholderText,
                    { fontSize: logoSize * 0.4 }
                  ]}>
                    {awayTeamName.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.teamName, 
              { 
                fontSize: teamNameSize,
                maxWidth: teamNameMaxWidth
              }
            ]} numberOfLines={1}>
              {awayTeamName}
            </Text>
          </View>
        </View>
        
        {/* Button to view statistics */}
        <TouchableOpacity
          style={[
            styles.viewStatsButton,
            {
              paddingVertical: isDesktop ? 18 : isLargeScreen ? 15 : 12,
              marginTop: isDesktop ? 20 : 15,
              marginHorizontal: isDesktop ? '22%' : isLargeScreen ? '18%' : '12%'
            }
          ]}
          onPress={() => handleSelectMatch(item)}
        >
          <Text style={[
            styles.viewStatsText,
            { fontSize: isDesktop ? 22 : isLargeScreen ? 20 : 18 }
          ]}>
            View Statistics
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Determine loading and error state
  const isLoading = isTeamLoading || isMatchesLoading;
  const isError = isTeamError || isMatchesError;
  const errorMessage = teamError?.message || matchesError?.message;

  if (isLoading) {
    return (
      <ScreenContainer
        fullWidth={isLargeScreen}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Loading matches...</Text>
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
          <Text style={styles.errorText}>
            {errorMessage || "Error loading matches"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchMatches()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
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
      <ScreenHeader
        title={team ? `${team.name} matches` : "Team matches"}
        onBack={handleGoBack}
        showBackButton={true}
        isMainScreen={false}
      />

      <View style={styles.content}>
        <View style={[
          styles.boxSelectorContainer,
          isDesktop && { paddingHorizontal: '1%', maxWidth: '100%' }
        ]}>
          <BoxSelector
            items={formattedMatches}
            onSelect={handleSelectMatch}
            emptyMessage="No matches found for this team"
            customRenderItem={renderMatchItem}
          />
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
    padding: 10,
    paddingBottom: 30,
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
  },
  boxSelectorContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
  },
  // Styles for custom match item
  matchItemContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  matchDateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  matchTeamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  teamContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  logoContainer: {
    marginBottom: 15,
  },
  teamLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#E6E0CE",
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
    maxWidth: 180,
  },
  scoreContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#eee",
    minWidth: 140,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  viewStatsButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "15%",
  },
  viewStatsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Existing styles
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
});