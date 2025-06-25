import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

export default function InfoScreen() {
  const [orientation, setOrientation] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height ? 'LANDSCAPE' : 'PORTRAIT'
  );

  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isLargeScreen = screenWidth > 768;

  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'LANDSCAPE' : 'PORTRAIT');
      setScreenWidth(width);
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription.remove();
    };
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    about: true,
    teams: false,
    players: false,
    matches: false,
    stats: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <ScreenContainer 
      fullWidth={isLargeScreen}
      contentContainerStyle={styles.contentContainer}
    >
      <ScreenHeader
        title="Information"
        showBackButton={false}
        isMainScreen={true}
      />

      <View style={styles.content}>
        {/* Each section */}
        {renderSection(
          "about",
          "About CourtVision",
          "information-circle-outline",
          expandedSections.about,
          toggleSection,
          [
            "CourtVision 1.0.0 is an app for basketball team management, with real-time statistics.",
            "Designed for coaches and analysts, it allows recording and analyzing performance.",
          ],
          [
            "Team and player management",
            "Live game recording",
            "Detailed statistical analysis",
            "PDF report export",
            "Optimized for mobile and tablet",
          ]
        )}

        {renderSection(
          "teams",
          "Team Creation",
          "people-outline",
          expandedSections.teams,
          toggleSection,
          [
            "Create and manage multiple teams, each with its roster and statistics.",
            "Steps to create a new team:"
          ],
          [
            "Go to 'Teams' in the main menu",
            "Tap 'Create a new team'",
            "Complete name and category",
            "Upload an optional logo",
            "Save the team and add players"
          ]
        )}

        {renderSection(
          "players",
          "Player Management",
          "person-outline",
          expandedSections.players,
          toggleSection,
          [
            "Each team has its roster of players with detailed profiles.",
            "Steps to add players:"
          ],
          [
            "Select a team and enter 'Players'",
            "Tap 'Add New Player'",
            "Complete name, number and position",
            "Add height, weight and age optionally",
            "Upload player photo if desired"
          ]
        )}

        {renderSection(
          "matches",
          "Game Recording",
          "basketball-outline",
          expandedSections.matches,
          toggleSection,
          [
            "Record complete games with real-time statistics.",
            "Steps to start a game:"
          ],
          [
            "Go to 'Start a Match'",
            "Select the team",
            "Configure opponent optionally",
            "Choose starters",
            "Record actions live: to add an statistic, tap the player and then the action",
          ]
        )}

        {renderSection(
          "stats",
          "Statistical Analysis",
          "stats-chart-outline",
          expandedSections.stats,
          toggleSection,
          [
            "When finishing a game, you get a complete performance analysis.",
            "Main statistics:"
          ],
          [
            "Quarter and final scores",
            "Individual performance",
            "Shooting percentages",
            "Rebounds, assists, steals, blocks, ...",
            "Valuation and advanced metrics"
          ]
        )}
      </View>
    </ScreenContainer>
  );
}

function renderSection(key, title, iconName, expanded, toggleSection, paragraphs, bullets) {
  return (
    <View key={key} style={styles.sectionContainer}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(key)}>
        <Text style={styles.sectionTitle}>
          <Ionicons name={iconName} size={22} color="#FFA500" /> {title}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="#666"
        />
      </TouchableOpacity>

      {/* Render content ONLY when expanded is true */}
      {expanded && (
        <View style={styles.sectionContent}>
          {paragraphs.map((p, index) => (
            <Text key={index} style={styles.paragraph}>{p}</Text>
          ))}
          <View style={styles.featureList}>
            {bullets.map((item, index) => (
              <Text key={index} style={styles.featureItem}>• {item}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
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
  sectionContainer: {
    marginBottom: 15,
    width: "100%",
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionContent: {
    backgroundColor: '#FFF5E1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 2,
  },
  paragraph: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  featureList: {
    marginTop: 5,
    marginLeft: 5,
  },
  featureItem: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 4,
  },
  footer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#EEE',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
  },
});