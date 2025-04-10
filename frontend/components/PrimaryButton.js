import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const PrimaryButton = ({ onPress, title, style, textStyle, disabled = false }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        style, 
        disabled && styles.buttonDisabled
      ]} 
      onPress={disabled ? null : onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.buttonText, 
        textStyle,
        disabled && styles.textDisabled
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#FFA500",
    paddingVertical: 10,    
    paddingHorizontal: 20,  
    borderRadius: 20,        
    marginTop: 10,
    width: 200,     
    alignSelf: "center",   
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.7,
  },
  textDisabled: {
    color: "#888888",
  }
});