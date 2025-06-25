import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";

const Scoreboard = ({
  matchId,
  teamAName = "UAB",
  teamBName = "Rival",
  period = "H1",
  initialTime = "10:00", // Starting time for the timer
  teamAScore = 0,        // Points received as props, instead of handling them internally
  teamBScore = 0,        // Points received as props, instead of handling them internally
  teamAFouls = 0,        // Fouls received as props, instead of handling them internally
  teamBFouls = 0,         // Fouls received as props, instead of handling them internally
  scale = 1,             // Scale factor to adjust size
  width,                 // Custom width (optional)
  compactMode = false    // Compact mode for small screens
}) => {
  const [isPlaying, setIsPlaying] = useState(false); // Starts paused
  const [currentPeriod, setCurrentPeriod] = useState(period);
  const [loading, setLoading] = useState(matchId ? true : false);
  const [match, setMatch] = useState(null);
  const [periodsHistory, setPeriodsHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // Update dimensions when screen size changes
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

  // Get match information if matchId is provided
  useEffect(() => {
    async function fetchMatchData() {
      try {
        if (!matchId) return;
        
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}`);
        if (!response.ok) throw new Error("Error loading match data");
        
        const data = await response.json();
        setMatch(data);
        
        // Initialize period if it exists
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

  // Update only the period in the server when it changes
  useEffect(() => {
    const updatePeriod = async () => {
      try {
        if (!matchId || loading) return;
        
        console.log("Updating period in server:", currentPeriod);
        
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            currentPeriod
          }),
        });
        
        if (!response.ok) throw new Error("Error updating period");
        console.log("Period updated in server:", currentPeriod);
      } catch (error) {
        console.error("Error updating period:", error);
      }
    };

    const saveTimeout = setTimeout(() => {
      if (!loading && matchId) updatePeriod();
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [currentPeriod, loading, matchId]);

  // Control the timer
  useEffect(() => {
    if (isPlaying && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsPlaying(false); // Auto-pause at 00:00
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  // New function to save the current period without changing periods
  const saveCurrentPeriod = async () => {
    try {
      if (!matchId) return;
      
      console.log("Saving statistics for current period:", currentPeriod);
      
      // Save current period stats
      const currentPeriodStats = {
        period: currentPeriod,
        teamAScore,
        teamBScore,
        teamAFouls,
        teamBFouls
      };
      
      // Update local history
      const updatedHistory = [...periodsHistory];
      
      const existingIndex = updatedHistory.findIndex(p => p.period === currentPeriod);
      
      if (existingIndex >= 0) {
        updatedHistory[existingIndex] = currentPeriodStats;
      } else {
        updatedHistory.push(currentPeriodStats);
      }
      
      setPeriodsHistory(updatedHistory);
      
      // Save to backend
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
      
      console.log("Period saved successfully");
    } catch (error) {
      console.error("Error saving period:", error);
    }
  };

  // Add effect to save current period when timer reaches zero
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

  // Function to change period and save statistics
  const handlePeriodChange = async (newPeriod) => {
    if (newPeriod === currentPeriod) return;
    
    try {
      console.log(`Changing from period ${currentPeriod} to ${newPeriod}`);
      
      // Save current period statistics
      const currentPeriodStats = {
        period: currentPeriod,
        teamAScore,
        teamBScore,
        teamAFouls,
        teamBFouls
      };
      
      console.log("Current period statistics:", currentPeriodStats);
      
      // Update local history
      const updatedHistory = [...periodsHistory];
      
      const existingIndex = updatedHistory.findIndex(p => p.period === currentPeriod);
      
      if (existingIndex >= 0) {
        updatedHistory[existingIndex] = currentPeriodStats;
      } else {
        updatedHistory.push(currentPeriodStats);
      }
      
      setPeriodsHistory(updatedHistory);
      
      // Save to backend using the general endpoint instead of the specific one
      if (matchId) {
        console.log("Saving period using general endpoint");
        
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
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
          console.error("Error saving period. Status:", response.status);
          throw new Error("Error saving period");
        }
        
        console.log("Period saved successfully");
      }
      
      // Change to new period
      setCurrentPeriod(newPeriod);
      
      // Reset timer for new period
      const [min, sec] = initialTime.split(":").map(Number);
      setTotalSeconds(min * 60 + sec);
      setIsPlaying(false);
    } catch (error) {
      console.error("Error changing period:", error);
    }
  };

  const toggleHistoryView = () => {
    setShowHistory(prev => !prev);
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

  // Adjust text sizes based on mode and scale factor
  const getFontSize = (baseSize) => {
    if (compactMode) {
      return baseSize * 0.8; // 20% smaller in compact mode
    }
    return baseSize;
  };

  // Process period history to show individual period scores
  const processedPeriodsHistory = () => {
    if (!periodsHistory || periodsHistory.length === 0) return [];
    
    // Sort periods chronologically
    const sortedPeriods = [...periodsHistory].sort((a, b) => {
      const periodOrder = { 'H1': 1, 'H2': 2, 'H3': 3, 'H4': 4 };
      return periodOrder[a.period] - periodOrder[b.period];
    });
    
    // Calculate per-period scores rather than cumulative
    let lastTeamAScore = 0;
    let lastTeamBScore = 0;
    
    return sortedPeriods.map((period, index) => {
      const periodTeamAScore = index === 0 
        ? period.teamAScore 
        : period.teamAScore - lastTeamAScore;
      
      const periodTeamBScore = index === 0 
        ? period.teamBScore 
        : period.teamBScore - lastTeamBScore;
      
      // Save current scores for next period calculation
      lastTeamAScore = period.teamAScore;
      lastTeamBScore = period.teamBScore;
      
      return {
        ...period,
        periodTeamAScore,
        periodTeamBScore
      };
    });
  };

  return (
    <View style={[
      styles.container, 
      { 
        transform: [{ scale }],
        width: width || 500 * scale,
        padding: compactMode ? 10 : 20
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
      
      <Text style={[styles.period, { fontSize: getFontSize(18) }]}>
        {currentPeriod}
      </Text>

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
      
      {/* Button to save the current period without changing (especially useful for H4) */}
      {currentPeriod === "H4" && (
        <TouchableOpacity onPress={saveCurrentPeriod} style={[styles.historyButton, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.historyButtonText}>
            Save Current Period
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Button to show/hide history */}
      {!compactMode && (
        <TouchableOpacity onPress={toggleHistoryView} style={styles.historyButton}>
          <Text style={styles.historyButtonText}>
            {showHistory ? "Hide History" : "View Period History"}
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Period history - only show in non-compact mode */}
      {!compactMode && showHistory && periodsHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Periods Summary</Text>
          {processedPeriodsHistory().map((p, index) => (
            <View key={index} style={styles.historyRow}>
              <Text style={styles.historyPeriod}>{p.period}</Text>
              <View style={styles.historyScores}>
                <Text style={styles.historyScore}>{p.periodTeamAScore} - {p.periodTeamBScore}</Text>
                <Text style={styles.historyFouls}>Fouls: {p.teamAFouls} - {p.teamBFouls}</Text>
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
    marginBottom: 5,
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
  },
  totalRow: {
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#ccc',
    borderBottomWidth: 0,
  }
});