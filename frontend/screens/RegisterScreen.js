import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
export default function SignUp(props) {
  const [name, setFullname] = useState();
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [phone, setPhone] = useState();

  const signup = async () => {
    console.log("🔹 Botón Sign Up presionado"); // <--- Agregado
  
    if (!name || !username || !email || !password || !phone) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      console.log("⛔ Falta completar campos"); // <--- Agregado
      return;
    }
  
    try {
      console.log("📤 Enviando solicitud a backend..."); // <--- Agregado
      const response = await fetch("http://localhost:3001/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, username, email, password, phone })
      });
  
      const data = await response.json();
      console.log("✅ Respuesta del backend:", data); // <--- Agregado
  
      if (response.ok) {
        Alert.alert('Registro exitoso', 'Bienvenido...');
        props.navigation.navigate('Home');
      } else {
        Alert.alert('Error en el registro', data.message || 'Ha ocurrido un problema.');
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error); // <--- Agregado
      Alert.alert('Error en el registro', error.message);
    }
  };  

  return (
    <View style={styles.screen}>
      <Text style={styles.principalText}>Registro</Text>
      <View style={styles.box}>
        <View style={styles.boxinside}>
          <TextInput placeholder='Full name' style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => setFullname(text)} />
        </View>
        <View style={styles.boxinside}>
          <TextInput placeholder='Username' style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => setUsername(text)} />
        </View>
        <View style={styles.boxinside}>
          <TextInput placeholder='Email' style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => setEmail(text)} />
        </View>
        <View style={styles.boxinside}>
          <TextInput placeholder='Password' style={[styles.input, { paddingHorizontal: 15 }]} secureTextEntry={true}
            onChangeText={(text) => setPassword(text)} />
        </View>
        <View style={styles.boxinside}>
          <TextInput placeholder='Phone' style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => setPhone(text)} />
        </View>
        <View style={styles.mainbuttonbox}>
          <TouchableOpacity style={styles.buttonbox} onPress={signup}>
            <Text style={styles.buttontext}>Sign up</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomtext}>
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => props.navigation.navigate('Login')}>
            <Text style={styles.signuptext}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  principalText: {
      fontSize: 40,
      color: 'white',
      marginBottom: 20,
      fontWeight: 'bold',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500',
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