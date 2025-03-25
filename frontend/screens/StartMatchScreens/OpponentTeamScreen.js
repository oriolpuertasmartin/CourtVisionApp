import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import BoxFill from "../../components/BoxFill";
import PrimaryButton from "../../components/PrimaryButton";

export default function OpponentTeamScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [formData, setFormData] = useState({
    nombre: "",
    category: "",
    photo: "",
  });

  const handleSubmit = () => {
    // Here you could send a PATCH request to update the match with opponent data.
    Alert.alert("Submitted", "Opponent data submitted for match: " + matchId);
    // Optionally, navigate further if needed:
    // navigation.navigate('NextScreen');
  };

  return (
    <View style={styles.container}>
      <BoxFill
        title="New match"
        fields={[
          { name: "nombre", placeholder: "Opponent Name" },
          { name: "category", placeholder: "Category" },
          { name: "photo", placeholder: "Photo", style: {height: 80}},
        ]}
        formData={formData}
        onChangeForm={setFormData}
      >
        <PrimaryButton title="Start the match" onPress={handleSubmit} />
      </BoxFill>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFF8E1",
    padding: 20,
  },
  header: { 
    fontSize: 30, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  matchId: { 
    fontSize: 18, 
    marginBottom: 20 
  },
  button: { 
    backgroundColor: "#FFA500", 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
});