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
import HeaderTitle from "../components/HeaderTitle";

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
      {/* Título usando el componente HeaderTitle */}
      <HeaderTitle>Information</HeaderTitle>

      <View style={styles.content}>
        {/* Cada sección */}
        {renderSection(
          "about",
          "Acerca de CourtVision",
          "information-circle-outline",
          expandedSections.about,
          toggleSection,
          [
            "CourtVision 1.0.0 es una app para gestión de equipos de baloncesto, con estadísticas en tiempo real.",
            "Diseñada para entrenadores y analistas, permite registrar y analizar el rendimiento.",
          ],
          [
            "Gestión de equipos y jugadores",
            "Registro de partidos en vivo",
            "Análisis de estadísticas detallado",
            "Exportación de reportes PDF",
            "Optimizado para móvil y tablet",
          ]
        )}

        {renderSection(
          "teams",
          "Creación de Equipos",
          "people-outline",
          expandedSections.teams,
          toggleSection,
          [
            "Crea y administra múltiples equipos, cada uno con su plantilla y estadísticas.",
            "Pasos para crear un nuevo equipo:"
          ],
          [
            "Accede a 'Teams' en el menú principal",
            "Pulsa 'Create a new team'",
            "Completa nombre y categoría",
            "Sube un logo opcional",
            "Guarda el equipo y añade jugadores"
          ]
        )}

        {renderSection(
          "players",
          "Gestión de Jugadores",
          "person-outline",
          expandedSections.players,
          toggleSection,
          [
            "Cada equipo tiene su plantilla de jugadores con perfiles detallados.",
            "Pasos para añadir jugadores:"
          ],
          [
            "Selecciona un equipo y entra en 'Players'",
            "Pulsa 'Add New Player'",
            "Completa nombre, número y posición",
            "Añade altura, peso y edad opcionalmente",
            "Sube foto del jugador si deseas"
          ]
        )}

        {renderSection(
          "matches",
          "Registro de Partidos",
          "basketball-outline",
          expandedSections.matches,
          toggleSection,
          [
            "Registra partidos completos con estadísticas en tiempo real.",
            "Pasos para iniciar un partido:"
          ],
          [
            "Accede a 'Start a Match'",
            "Selecciona el equipo",
            "Configura rival opcionalmente",
            "Elige titulares",
            "Registra acciones en vivo"
          ]
        )}

        {renderSection(
          "stats",
          "Análisis de Estadísticas",
          "stats-chart-outline",
          expandedSections.stats,
          toggleSection,
          [
            "Al terminar un partido, obtienes un análisis completo de rendimiento.",
            "Estadísticas principales:"
          ],
          [
            "Puntuaciones por cuarto y final",
            "Rendimiento individual",
            "Porcentajes de tiro",
            "Rebotes, asistencias, robos",
            "Valoración y métricas avanzadas"
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

      {/* Renderizar el contenido SOLO cuando expanded es true */}
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