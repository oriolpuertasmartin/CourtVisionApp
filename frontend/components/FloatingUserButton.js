import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FloatingUserButton({ user, onPress, onLogout }) {
  const [modalVisible, setModalVisible] = useState(false);

  // Obtener las iniciales del usuario para mostrar si no hay foto de perfil
  const getUserInitials = () => {
    return user?.name ? user.name.substring(0, 2).toUpperCase() : user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  // Función para confirmar cierre de sesión (similar a SettingsScreen)
  const confirmLogout = () => {
    setModalVisible(false); // Primero cerrar el modal actual
    
    console.log("FloatingUserButton: Botón de cerrar sesión presionado");
    
    // Comportamiento específico para plataforma web
    if (Platform.OS === 'web') {
      // En web, usamos confirm nativo del navegador
      if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        console.log("FloatingUserButton: Confirmación web recibida");
        onLogout && onLogout();
      }
    } else {
      // Para móviles, seguimos usando Alert.alert
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
              console.log("FloatingUserButton: Confirmación de cierre de sesión recibida");
              onLogout && onLogout();
            }
          }
        ]
      );
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setModalVisible(true)}
      >
        {user?.profile_photo ? (
          <Image 
            source={{ uri: user.profile_photo }} 
            style={styles.profilePhoto} 
          />
        ) : (
          <View style={styles.statusIndicator}>
            <Text style={styles.initialsText}>{getUserInitials()}</Text>
          </View>
        )}
        <View>
          <Text style={styles.text}>{user?.username || 'Usuario'}</Text>
          <Text style={styles.subtext}>{user?.email || 'email@ejemplo.com'}</Text>
        </View>
      </TouchableOpacity>

      {/* Modal para opciones de perfil */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                onPress && onPress();
              }}
            >
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.modalOptionText}>Ver Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, styles.logoutOption]}
              onPress={confirmLogout}  // Cambiado para usar la nueva función confirmLogout
            >
              <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
              <Text style={[styles.modalOptionText, { color: '#D32F2F' }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#D9D9D9',
    padding: 18,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFA500',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  initialsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  subtext: {
    color: 'black',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 30,
  },
  modalView: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  logoutOption: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  modalOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});