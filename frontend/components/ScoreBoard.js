import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";

const Scoreboard = ({
  matchId,
  teamAName = "UAB",
  teamBName = "Rival",
  period = "H1",
  initialTime = "10:00",
  teamAScore = 0,
  teamBScore = 0,
  teamAFouls = 0,
  teamBFouls = 0,
  scale = 1,
  width,
  compactMode = false,
  onFinish // <-- Añadido para el botón de finalizar partido
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(period);
  const [loading, setLoading] = useState(matchId ? true : false);
  const [match, setMatch] = useState(null);
  const [periodsHistory, setPeriodsHistory] = useState([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, []);

  const [totalSeconds, setTotalSeconds] = useState(() => {
    const [min, sec] = initialTime.split(":").map(Number);
    return min * 60 + sec;
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    async function fetchMatchData() {
      try {
        if (!matchId) return;
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}`);
        if (!response.ok) throw new Error("Error loading match data");
        const data = await response.json();
        setMatch(data);
        if (data.currentPeriod) setCurrentPeriod(data.currentPeriod);
        if (data.periodsHistory) setPeriodsHistory(data.periodsHistory);
        setLoading(false);
      } catch (error) {
        console.error("Error loading match data:", error);
        setLoading(false);
      }
    }
    if (matchId) fetchMatchData();
  }, [matchId]);

  useEffect(() => {
    const updatePeriod = async () => {
      try {
        if (!matchId || loading) return;
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPeriod }),
        });
        if (!response.ok) throw new Error("Error updating period");
      } catch (error) {
        console.error("Error updating period:", error);
      }
    };

    const saveTimeout = setTimeout(() => {
      if (!loading && matchId) updatePeriod();
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [currentPeriod, loading, matchId]);

  useEffect(() => {
    if (isPlaying && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const saveCurrentPeriod = async () => {
    try {
      if (!matchId) return;
      const currentPeriodStats = {
        period: currentPeriod,
        teamAScore,
        teamBScore,
        teamAFouls,
        teamBFouls
      };
      const updatedHistory = [...periodsHistory];
      const existingIndex = updatedHistory.findIndex(p => p.period === currentPeriod);
      if (existingIndex >= 0) {
        updatedHistory[existingIndex] = currentPeriodStats;
      } else {
        updatedHistory.push(currentPeriodStats);
      }
      setPeriodsHistory(updatedHistory);
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodsHistory: updatedHistory,
          currentPeriod,
          teamAScore,
          teamBScore,
          teamAFouls,
          teamBFouls
        }),
      });
      if (!response.ok) {
        throw new Error("Error saving period");
      }
    } catch (error) {
      console.error("Error saving period:", error);
    }
  };

  useEffect(() => {
    if (totalSeconds === 0 && !isPlaying) {
      saveCurrentPeriod();
    }
  }, [totalSeconds, isPlaying]);

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

  const handlePeriodChange = async (newPeriod) => {
    if (newPeriod === currentPeriod) return;
    try {
      const currentPeriodStats = {
        period: currentPeriod,
        teamAScore,
        teamBScore,
        teamAFouls,
        teamBFouls
      };
      const updatedHistory = [...periodsHistory];
      const existingIndex = updatedHistory.findIndex(p => p.period === currentPeriod);
      if (existingIndex >= 0) {
        updatedHistory[existingIndex] = currentPeriodStats;
      } else {
        updatedHistory.push(currentPeriodStats);
      }
      setPeriodsHistory(updatedHistory);
      if (matchId) {
        await fetch(`${API_BASE_URL}/matches/${matchId}`, {
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
      }
      setCurrentPeriod(newPeriod);
      const [min, sec] = initialTime.split(":").map(Number);
      setTotalSeconds(min * 60 + sec);
      setIsPlaying(false);
    } catch (error) {
      console.error("Error changing period:", error);
    }
  };

  if (loading && matchId) {
    return (
      <View style={[
        styles.container,
        {
          transform: [{ scale }],
          width: width || 500 * scale,
          padding: compactMode ? 10 : 20
        }
      ]}>
        <Text style={styles.period}>Loading...</Text>
      </View>
    );
  }

  const getFontSize = (baseSize) => {
    if (compactMode) {
      return baseSize * 0.8;
    }
    return baseSize;
  };

  return (
    <View style={[
      styles.container,
      {
        transform: [{ scale }],
        width: width || 260 * scale,
        padding: compactMode ? 6 : 12,
        paddingBottom: compactMode ? 30 : 40
      }
    ]}>
      {/* Period selector - 4 quarters (H1, H2, H3, H4) */}
      <View style={styles.periodSelector}>
        <TouchableOpacity onPress={() => handlePeriodChange("H1")}>
          <Text style={[
            styles.periodOption,
            currentPeriod === "H1" && styles.activePeriod,
            { fontSize: getFontSize(14) }
          ]}>H1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange("H2")}>
          <Text style={[
            styles.periodOption,
            currentPeriod === "H2" && styles.activePeriod,
            { fontSize: getFontSize(14) }
          ]}>H2</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange("H3")}>
          <Text style={[
            styles.periodOption,
            currentPeriod === "H3" && styles.activePeriod,
            { fontSize: getFontSize(14) }
          ]}>H3</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange("H4")}>
          <Text style={[
            styles.periodOption,
            currentPeriod === "H4" && styles.activePeriod,
            { fontSize: getFontSize(14) }
          ]}>H4</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teamColumn}>
          <Text style={[styles.teamName, { fontSize: getFontSize(25) }]}>
            {compactMode && teamAName.length > 5 ? teamAName.substring(0, 5) + "..." : teamAName}
          </Text>
          <Text style={[styles.score, { fontSize: getFontSize(42) }]}>
            {teamAScore}
          </Text>
        </View>
        <View style={styles.teamColumn}>
          <Text style={[styles.teamName, { fontSize: getFontSize(25) }]}>
            {compactMode && teamBName.length > 5 ? teamBName.substring(0, 5) + "..." : teamBName}
          </Text>
          <Text style={[styles.score, { fontSize: getFontSize(42) }]}>
            {teamBScore}
          </Text>
        </View>
      </View>

      <Text style={[styles.time, { fontSize: getFontSize(20) }]}>
        {formatTime(totalSeconds)}
      </Text>

      <TouchableOpacity onPress={togglePlayPause} style={styles.playPause}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={compactMode ? 24 : 32}
          color="black"
        />
      </TouchableOpacity>

      <View style={styles.foulRow}>
        <Text style={[styles.foulLabel, { fontSize: getFontSize(16) }]}>
          Fouls:
        </Text>
        <Text style={[styles.foulText, { fontSize: getFontSize(18) }]}>
          {teamAFouls}
        </Text>
        <Text style={[styles.foulSeparator, { fontSize: getFontSize(18) }]}>
          -
        </Text>
        <Text style={[styles.foulText, { fontSize: getFontSize(18) }]}>
          {teamBFouls}
        </Text>
      </View>

      {/* Botón para finalizar el partido */}
      {typeof onFinish === "function" && (
        <TouchableOpacity
          onPress={onFinish}
          style={{
            backgroundColor: "#D9534F",
            width: 200,
            marginTop: 10,
            paddingVertical: 10,
            borderRadius: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
            Finish the match
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Scoreboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    width: 340,
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
    marginBottom: 5,
  },
  historyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});