import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Scoreboard = ({
  teamAName = "UAB",
  teamBName = "UPC",
  teamAScore = 15,
  teamBScore = 25,
  teamAFouls = 4,
  teamBFouls = 3,
  period = "H1",
  initialTime = "10:00", // Aquí arranca el cronómetro
}) => {
  const [isPlaying, setIsPlaying] = useState(false); // Empieza pausado

  const [totalSeconds, setTotalSeconds] = useState(() => {
    const [min, sec] = initialTime.split(":").map(Number);
    return min * 60 + sec;
  });

  const intervalRef = useRef(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.period}>{period}</Text>

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
        <Text style={styles.foulText}>{teamAFouls}</Text>
        <Text style={styles.foulText}>{teamBFouls}</Text>
      </View>
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
    fontSize: 28,
    fontWeight: "bold",
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
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 30,
  },
  foulText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
});
