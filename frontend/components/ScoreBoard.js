import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Scoreboard = ({
  matchId,
  teamAName = "UAB",
  teamBName = "Rival",
  period = "H1",
  initialTime = "10:00", // Aquí arranca el cronómetro
  teamAScore = 0,        // Recibe los puntos como prop, en lugar de manejarlos internamente
  teamBScore = 0,        // Recibe los puntos como prop, en lugar de manejarlos internamente
  teamAFouls = 0,        // Recibe las faltas como prop, en lugar de manejarlas internamente
  teamBFouls = 0         // Recibe las faltas como prop, en lugar de manejarlas internamente
}) => {
  const [isPlaying, setIsPlaying] = useState(false); // Empieza pausado
  const [currentPeriod, setCurrentPeriod] = useState(period);
  const [loading, setLoading] = useState(matchId ? true : false);
  const [match, setMatch] = useState(null);
  const [periodsHistory, setPeriodsHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [totalSeconds, setTotalSeconds] = useState(() => {
    const [min, sec] = initialTime.split(":").map(Number);
    return min * 60 + sec;
  });

  const intervalRef = useRef(null);

  // Obtener información del partido si se proporciona un matchId
  useEffect(() => {
    async function fetchMatchData() {
      try {
        if (!matchId) return;
        
        const response = await fetch(`http://localhost:3001/matches/${matchId}`);
        if (!response.ok) throw new Error("Error al obtener datos del partido");
        
        const data = await response.json();
        setMatch(data);
        
        // Inicializar el periodo si existe
        if (data.currentPeriod) setCurrentPeriod(data.currentPeriod);
        if (data.periodsHistory) setPeriodsHistory(data.periodsHistory);
        
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos del partido:", error);
        setLoading(false);
      }
    }
    
    if (matchId) fetchMatchData();
  }, [matchId]);

  // Actualizar solo el periodo en el servidor cuando cambia
  useEffect(() => {
    const updatePeriod = async () => {
      try {
        if (!matchId || loading) return;
        
        console.log("Actualizando período en el servidor:", currentPeriod);
        
        const response = await fetch(`http://localhost:3001/matches/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            currentPeriod
          }),
        });
        
        if (!response.ok) throw new Error("Error al actualizar el periodo");
        console.log("Período actualizado en el servidor:", currentPeriod);
      } catch (error) {
        console.error("Error al actualizar el periodo:", error);
      }
    };

    const saveTimeout = setTimeout(() => {
      if (!loading && matchId) updatePeriod();
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [currentPeriod, loading, matchId]);

  // Controlar el cronómetro
  useEffect(() => {
    if (isPlaying && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsPlaying(false); // Se pausa automáticamente en 00:00
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const togglePlayPause = () => {
    if (totalSeconds > 0) {
      setIsPlaying((prev) => !prev);
    }
  };

  // Función para cambiar de periodo y guardar las estadísticas
  // Actualizar la función handlePeriodChange para usar el endpoint general

const handlePeriodChange = async (newPeriod) => {
  if (newPeriod === currentPeriod) return;
  
  try {
    console.log(`Cambiando de periodo ${currentPeriod} a ${newPeriod}`);
    
    // Guardar estadísticas del periodo actual
    const currentPeriodStats = {
      period: currentPeriod,
      teamAScore,
      teamBScore,
      teamAFouls,
      teamBFouls
    };
    
    console.log("Estadísticas del periodo actual:", currentPeriodStats);
    
    // Actualizar historial local
    const updatedHistory = [...periodsHistory];
    
    const existingIndex = updatedHistory.findIndex(p => p.period === currentPeriod);
    
    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = currentPeriodStats;
    } else {
      updatedHistory.push(currentPeriodStats);
    }
    
    setPeriodsHistory(updatedHistory);
    
    // Guardar en el backend usando el endpoint general en lugar del específico
    if (matchId) {
      console.log("Guardando periodo usando endpoint general");
      
      const response = await fetch(`http://localhost:3001/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          periodsHistory: updatedHistory,
          currentPeriod: newPeriod,
          teamAScore,
          teamBScore,
          teamAFouls,
          teamBFouls
        }),
      });
      
      if (!response.ok) {
        console.error("Error al guardar periodo. Estado:", response.status);
        throw new Error("Error al guardar periodo");
      }
      
      console.log("Periodo guardado exitosamente");
    }
    
    // Cambiar al nuevo periodo
    setCurrentPeriod(newPeriod);
    
    // Reiniciar cronómetro para el nuevo periodo
    const [min, sec] = initialTime.split(":").map(Number);
    setTotalSeconds(min * 60 + sec);
    setIsPlaying(false);
  } catch (error) {
    console.error("Error al cambiar de periodo:", error);
  }
};

  const toggleHistoryView = () => {
    setShowHistory(prev => !prev);
  };

  if (loading && matchId) {
    return (
      <View style={styles.container}>
        <Text style={styles.period}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Selector de periodos - 4 cuartos (H1, H2, H3, H4) */}
      <View style={styles.periodSelector}>
        <TouchableOpacity onPress={() => handlePeriodChange("H1")}>
          <Text style={[styles.periodOption, currentPeriod === "H1" && styles.activePeriod]}>H1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange("H2")}>
          <Text style={[styles.periodOption, currentPeriod === "H2" && styles.activePeriod]}>H2</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange("H3")}>
          <Text style={[styles.periodOption, currentPeriod === "H3" && styles.activePeriod]}>H3</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange("H4")}>
          <Text style={[styles.periodOption, currentPeriod === "H4" && styles.activePeriod]}>H4</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.period}>{currentPeriod}</Text>

      <View style={styles.scoreRow}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{teamAName}</Text>
          <Text style={styles.score}>{teamAScore}</Text>
        </View>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{teamBName}</Text>
          <Text style={styles.score}>{teamBScore}</Text>
        </View>
      </View>

      <Text style={styles.time}>{formatTime(totalSeconds)}</Text>

      <TouchableOpacity onPress={togglePlayPause} style={styles.playPause}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="black" />
      </TouchableOpacity>

      <View style={styles.foulRow}>
        <Text style={styles.foulLabel}>Faltas:</Text>
        <Text style={styles.foulText}>{teamAFouls}</Text>
        <Text style={styles.foulSeparator}>-</Text>
        <Text style={styles.foulText}>{teamBFouls}</Text>
      </View>
      
      {/* Botón para mostrar/ocultar historial */}
      <TouchableOpacity onPress={toggleHistoryView} style={styles.historyButton}>
        <Text style={styles.historyButtonText}>
          {showHistory ? "Ocultar Historial" : "Ver Historial por Periodos"}
        </Text>
      </TouchableOpacity>
      
      {/* Historial de periodos */}
      {showHistory && periodsHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Resumen por Periodos</Text>
          {periodsHistory.map((p, index) => (
            <View key={index} style={styles.historyRow}>
              <Text style={styles.historyPeriod}>{p.period}</Text>
              <View style={styles.historyScores}>
                <Text style={styles.historyScore}>{p.teamAScore} - {p.teamBScore}</Text>
                <Text style={styles.historyFouls}>Faltas: {p.teamAFouls} - {p.teamBFouls}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default Scoreboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: 500,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  period: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  teamColumn: {
    alignItems: "center",
  },
  teamName: {
    fontWeight: "bold",
    fontSize: 25,
    marginBottom: 3,
  },
  score: {
    fontSize: 42,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  time: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  playPause: {
    marginBottom: 10,
  },
  foulRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  foulLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  foulText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginHorizontal: 5,
  },
  foulSeparator: {
    fontSize: 18,
    color: "#444",
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  periodOption: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  activePeriod: {
    backgroundColor: '#FFA500',
    color: 'white',
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 5,
  },
  historyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  historyContainer: {
    width: '100%',
    marginTop: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyPeriod: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 40,
  },
  historyScores: {
    flex: 1,
    alignItems: 'flex-end',
  },
  historyScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyFouls: {
    fontSize: 12,
    color: '#666',
  }
});