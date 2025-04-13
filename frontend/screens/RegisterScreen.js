import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import API_BASE_URL from "../config/apiConfig";
import { useMutation } from '@tanstack/react-query';

export default function SignUp({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: ""
  });

  // Usar useMutation para el proceso de registro
  const { mutate: registerUser, isPending, isError, error } = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }
      
      return data;
    },
    onSuccess: (data) => {
      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada correctamente.');
      navigation.navigate('Login');
    },
    onError: (error) => {
      Alert.alert('Error en el registro', error.message);
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validación de campos
    const { name, username, email, password, phone } = formData;
    
    if (!name || !username || !email || !password || !phone) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor, introduce un email válido.');
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
            placeholder='Full name' 
            style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => handleChange('name', text)}
            value={formData.name}
            autoCapitalize="words"
            editable={!isPending}
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput 
            placeholder='Username' 
            style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => handleChange('username', text)}
            value={formData.username}
            autoCapitalize="none"
            editable={!isPending}
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput 
            placeholder='Email' 
            style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => handleChange('email', text)}
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isPending}
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput 
            placeholder='Password' 
            style={[styles.input, { paddingHorizontal: 15 }]} 
            secureTextEntry={true}
            onChangeText={(text) => handleChange('password', text)}
            value={formData.password}
            editable={!isPending}
          />
        </View>
        <View style={styles.boxinside}>
          <TextInput 
            placeholder='Phone' 
            style={[styles.input, { paddingHorizontal: 15 }]}
            onChangeText={(text) => handleChange('phone', text)}
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
            onPress={() => navigation.navigate('Login')}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#FFC966', // Un tono más claro para indicar estado deshabilitado
    opacity: 0.7,
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