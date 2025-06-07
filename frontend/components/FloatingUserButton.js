import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, conditionalScale, getDeviceType } from '../utils/responsive';

export default function FloatingUserButton({ user, onPress, onLogout }) {
  const [modalVisible, setModalVisible] = useState(false);
  const deviceType = getDeviceType();

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

  // Calcular dimensiones responsivas según el dispositivo
  const photoSize = conditionalScale(50, {
    desktop: 60,
    tablet: 55,
    phone: 50,
    smallPhone: 40
  });

  const buttonPadding = conditionalScale(18, {
    desktop: 20,
    tablet: 18,
    phone: 15,
    smallPhone: 12
  });

  const borderRadius = photoSize / 2;
  
  const iconSize = conditionalScale(24, {
    desktop: 28,
    tablet: 26,
    phone: 24,
    smallPhone: 20
  });

  // Calcular el margen correcto según el tamaño del dispositivo
  // Reducido de 15 a valores más pequeños según el dispositivo
  const photoMargin = conditionalScale(8, {
    desktop: 10,
    tablet: 9,
    phone: 8,
    smallPhone: 6
  });

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.button,
          {
            padding: buttonPadding,
            borderRadius: borderRadius + 10,  // Un poco más grande que la foto
            bottom: scale(20),
            right: scale(20)
          }
        ]} 
        onPress={() => setModalVisible(true)}
      >
        {user?.profile_photo ? (
          <Image 
            source={{ uri: user.profile_photo }} 
            style={[
              styles.profilePhoto,
              {
                width: photoSize,
                height: photoSize,
                borderRadius: borderRadius,
                marginRight: photoMargin // Aquí hacemos el cambio principal
              }
            ]} 
          />
        ) : (
          <View style={[
            styles.statusIndicator,
            {
              width: photoSize,
              height: photoSize,
              borderRadius: borderRadius,
              marginRight: photoMargin // Aquí hacemos el cambio principal
            }
          ]}>
            <Text style={[
              styles.initialsText,
              {
                fontSize: conditionalScale(20, {
                  desktop: 24,
                  tablet: 22,
                  phone: 20,
                  smallPhone: 16
                })
              }
            ]}>
              {getUserInitials()}
            </Text>
          </View>
        )}
        <View>
          <Text style={[
            styles.text,
            {
              fontSize: conditionalScale(18, {
                desktop: 20,
                tablet: 18,
                phone: 16,
                smallPhone: 14
              })
            }
          ]}>
            {user?.username || 'Usuario'}
          </Text>
          <Text style={[
            styles.subtext,
            {
              fontSize: conditionalScale(14, {
                desktop: 16,
                tablet: 14,
                phone: 12,
                smallPhone: 10
              })
            }
          ]}>
            {user?.email || 'email@ejemplo.com'}
          </Text>
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
          <View style={[
            styles.modalView,
            {
              width: conditionalScale(200, {
                desktop: 250,
                tablet: 230,
                phone: 200,
                smallPhone: 180
              }),
              padding: scale(10)
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.modalOption,
                {
                  paddingVertical: scale(12),
                  paddingHorizontal: scale(15)
                }
              ]}
              onPress={() => {
                setModalVisible(false);
                onPress && onPress();
              }}
            >
              <Ionicons name="person-outline" size={iconSize} color="#333" />
              <Text style={[
                styles.modalOptionText,
                {
                  marginLeft: scale(10),
                  fontSize: conditionalScale(16, {
                    desktop: 18,
                    tablet: 17,
                    phone: 16,
                    smallPhone: 14
                  })
                }
              ]}>
                Ajustes del perfil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.modalOption, 
                styles.logoutOption,
                {
                  paddingVertical: scale(12),
                  paddingHorizontal: scale(15),
                  marginTop: scale(5),
                  paddingTop: scale(15)
                }
              ]}
              onPress={confirmLogout}
            >
              <Ionicons name="log-out-outline" size={iconSize} color="#D32F2F" />
              <Text style={[
                styles.modalOptionText,
                { 
                  color: '#D32F2F',
                  marginLeft: scale(10),
                  fontSize: conditionalScale(16, {
                    desktop: 18,
                    tablet: 17,
                    phone: 16,
                    smallPhone: 14
                  })
                }
              ]}>
                Cerrar Sesión
              </Text>
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
    backgroundColor: '#D9D9D9',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusIndicator: {
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhoto: {
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  initialsText: {
    color: 'white',
    fontWeight: 'bold',
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
  },
  subtext: {
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: scale(30),
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
  },
  logoutOption: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalOptionText: {
    color: '#333',
  },
});