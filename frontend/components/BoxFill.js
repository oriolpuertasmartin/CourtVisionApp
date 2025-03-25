import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const BoxFill = ({ title, fields, formData, onChangeForm, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.form}>
        {fields.map((field) => (
          <TextInput
            key={field.name}
            style={[styles.input, field.style]}
            placeholder={field.placeholder}
            placeholderTextColor="gray"
            value={formData[field.name] || ""}
            onChangeText={(text) =>
              onChangeForm({ ...formData, [field.name]: text })
            }
          />
        ))}
        {children}
      </View>
    </View>
  );
};

export default BoxFill;

const styles = StyleSheet.create({
  container: {
    width: "80%",
    marginVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 44,
    marginBottom: 20,
    fontWeight: "bold",
  },
  form: {
    width: "70%",
    backgroundColor: "#E8E0C9",
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 10,
    elevation: 3,
  },
  input: {
    height: 40,
    borderColor: "gray",
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#FFF9E7",
    color: "gray",
    borderRadius: 8,
  },
});