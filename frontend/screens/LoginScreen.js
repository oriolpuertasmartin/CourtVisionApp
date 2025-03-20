import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";

export default function LogIn(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    try {
      console.log("📤 Enviando solicitud de inicio de sesión...", { email, password }); // <--- Agregado
      const response = await fetch("http://localhost:3001/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("✅ Respuesta del backend:", data); // <--- Agregado

      if (response.ok) {
        Alert.alert('Inicio de sesión exitoso', 'Bienvenido de nuevo.');
        props.navigation.navigate('Main'); // Redirigir a la pantalla de inicio
      } else {
        Alert.alert('Error en el inicio de sesión', data.message || 'Ha ocurrido un problema.');
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error); // <--- Agregado
      Alert.alert('Error en el inicio de sesión', error.message);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.principalText}>Iniciar Sesión</Text>
      <View style={styles.box}>
        <View style={styles.boxinside}>
          <TextInput
            placeholder='Email'
            style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput
            placeholder='Password'
            style={[styles.input, { paddingHorizontal: 15 }]}
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
        </View>
        <View style={styles.mainbuttonbox}>
          <TouchableOpacity style={styles.buttonbox} onPress={login}>
            <Text style={styles.buttontext}>Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomtext}>
          <Text>¿No tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => props.navigation.navigate('Register')}>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500',
  },
  principalText: {
    fontSize: 40,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  box: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: "90%",
    padding: 20,
    shadowColor: 'black',
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
    alignItems: 'center',
  },
  buttonbox: {
    backgroundColor: '#FFA500',
    borderRadius: 30,
    paddingVertical: 20,
    width: 150,
    marginTop: 20,
  },
  buttontext: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomtext: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signuptext: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    color: '#A9A9A9',
  },
});