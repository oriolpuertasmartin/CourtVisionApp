import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import authService from "../services/authService";

export default function SignUp({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Usar useMutation con el authService
  const {
    mutate: registerUser,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: (data) => {
      Alert.alert(
        "Registration successful",
        "Your account has been created successfully."
      );
      navigation.navigate("Login");
    },
    onError: (error) => {
      Alert.alert("Registration error", error.message);
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Validación de campos
    const { name, username, email, password, phone } = formData;

    if (!name || !username || !email || !password || !phone) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // Ejecutar la mutación de registro
    registerUser(formData);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.principalText}>Register</Text>
      <View style={styles.box}>
        <View style={styles.boxinside}>
          <TextInput
            placeholder="Full name"
            style={styles.input}
            onChangeText={(text) => handleChange("name", text)}
            value={formData.name}
            autoCapitalize="words"
            editable={!isPending}
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput
            placeholder="Username"
            style={styles.input}
            onChangeText={(text) => handleChange("username", text)}
            value={formData.username}
            autoCapitalize="none"
            editable={!isPending}
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            onChangeText={(text) => handleChange("email", text)}
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isPending}
          />
        </View>
        <View style={styles.boxinside}>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry={!showPassword}
              onChangeText={(text) => handleChange("password", text)}
              value={formData.password}
              editable={!isPending}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconButton}
              disabled={isPending}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#A9A9A9"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.boxinside}>
          <TextInput
            placeholder="Phone"
            style={styles.input}
            onChangeText={(text) => handleChange("phone", text)}
            value={formData.phone}
            keyboardType="phone-pad"
            editable={!isPending}
          />
        </View>
        <View style={styles.mainbuttonbox}>
          <TouchableOpacity
            style={[styles.buttonbox, isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttontext}>Sign up</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.bottomtext}>
          <Text>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            disabled={isPending}
          >
            <Text style={styles.signuptext}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  principalText: {
    fontSize: 50,
    color: "white",
    marginBottom: 20,
    fontWeight: "bold",
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EB850B",
  },
  box: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    padding: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  boxinside: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#cccccc40",
    borderRadius: 30,
    marginVertical: 10,
    marginLeft: 15,
    marginRight: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  input: {
    color: "#A9A9A9",
    paddingVertical: 10,
    flex: 1,
  },
  eyeIconButton: {
    padding: 8,
    marginLeft: 10,
  },
  mainbuttonbox: {
    alignItems: "center",
  },
  buttonbox: {
    backgroundColor: "#EB850B",
    borderRadius: 30,
    paddingVertical: 20,
    width: 150,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#FFC966",
    opacity: 0.7,
  },
  buttontext: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  bottomtext: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signuptext: {
    marginLeft: 5,
    fontWeight: "bold",
    color: "black",
  },
});