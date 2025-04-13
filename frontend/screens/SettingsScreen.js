import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen({ handleLogout }) {
    const navigation = useNavigation();

    // Esta función maneja el cierre de sesión localmente
    const confirmLogout = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que quieres cerrar sesión?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sí, cerrar sesión",
                    onPress: () => {
                        // Si recibimos la función handleLogout como prop, la usamos
                        if (handleLogout) {
                            console.log("Usando handleLogout de App.js");
                            handleLogout();
                        } else {
                            // En caso contrario, hacemos el logout manualmente
                            console.log("Fallback: limpiando AsyncStorage y navegando a Welcome");
                            logoutManually();
                        }
                    }
                }
            ]
        );
    };

    // Método de respaldo para cerrar sesión manualmente
    const logoutManually = async () => {
        try {
            console.log("Ejecutando cierre de sesión manual");
            
            // Limpiar AsyncStorage
            await AsyncStorage.removeItem('user');
            console.log("Usuario eliminado de AsyncStorage");

            // En web, es posible que necesitemos un enfoque diferente
            if (Platform.OS === 'web') {
                console.log("Plataforma web detectada, usando window.location");
                // Para web, podemos forzar una recarga completa
                window.location.href = '/';
                return;
            }
            
            // Para aplicaciones móviles, usamos la navegación estándar
            console.log("Navegando a Welcome usando navigation.reset");
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        } catch (error) {
            console.error("Error en logoutManually:", error);
            Alert.alert("Error", "No se pudo cerrar sesión. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Configuración</Text>
            
            <View style={styles.settingsContainer}>
                {/* Aquí puedes agregar otras opciones de configuración */}
                
                {/* Botón de cerrar sesión */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={confirmLogout}
                >
                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                </TouchableOpacity>
                
                {/* Para depuración - Solo visible en desarrollo */}
                {__DEV__ && (
                    <Text style={styles.debugText}>
                        Plataforma: {Platform.OS}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF8E1",
        paddingTop: 80,
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 40,
    },
    settingsContainer: {
        width: '90%',
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#D9534F',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    debugText: {
        marginTop: 20,
        color: '#888',
        fontSize: 12,
    }
});