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
import API_BASE_URL from "../config/apiConfig";
import { useMutation } from "@tanstack/react-query";

export default function LogIn({ navigation, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Usar useMutation para el proceso de inicio de sesión
  const {
    mutate: loginUser,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el inicio de sesión");
      }

      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      Alert.alert("Inicio de sesión exitoso", "Bienvenido de nuevo.");
      navigation.navigate("Main");
    },
    onError: (error) => {
      Alert.alert("Error en el inicio de sesión", error.message);
    },
  });

  const handleLogin = () => {
    // Validación de campos
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    // Ejecutar la mutación
    loginUser({ email, password });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.principalText}>Iniciar Sesión</Text>
      <View style={styles.box}>
        <View style={styles.boxinside}>
          <TextInput
            placeholder="Email"
            style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => setEmail(text)}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput
            placeholder="Password"
            style={[styles.input, { paddingHorizontal: 15 }]}
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
        </View>
        <View style={styles.mainbuttonbox}>
          <TouchableOpacity
            style={[styles.buttonbox, isPending && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttontext}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.bottomtext}>
          <Text>¿No tienes una cuenta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            disabled={isPending}
          >
            <Text style={styles.signuptext}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EB850B",
  },
  principalText: {
    fontSize: 50,
    color: "white",
    marginBottom: 20,
    fontWeight: "bold",
  },
  box: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "70%",
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
    paddingVertical: 20,
    backgroundColor: "#cccccc40",
    borderRadius: 30,
    marginVertical: 10,
    marginLeft: 15,
    marginRight: 15,
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
    backgroundColor: "#FFC966", // Un tono más claro para indicar estado deshabilitado
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
  input: {
    color: "#A9A9A9",
  },
});
