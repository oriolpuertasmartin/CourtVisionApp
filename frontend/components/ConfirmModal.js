import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { scale, conditionalScale, getDeviceType } from '../utils/responsive';

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  const deviceType = getDeviceType();
  const screenWidth = Dimensions.get('window').width;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={[
          styles.modalView,
          {
            width: conditionalScale('80%', {
              desktop: '50%',
              tablet: '70%',
              phone: '80%',
              smallPhone: '90%'
            }),
            maxWidth: conditionalScale(350, {
              desktop: 450,
              tablet: 400,
              phone: 350,
              smallPhone: 300
            }),
            padding: scale(20)
          }
        ]}>
          {title && <Text style={[
            styles.modalTitle,
            {
              fontSize: conditionalScale(18, {
                desktop: 22,
                tablet: 20,
                phone: 18,
                smallPhone: 16
              }),
              marginBottom: scale(10)
            }
          ]}>{title}</Text>}
          
          <Text style={[
            styles.modalText,
            {
              marginBottom: scale(20),
              fontSize: conditionalScale(16, {
                desktop: 18,
                tablet: 17,
                phone: 16,
                smallPhone: 14
              })
            }
          ]}>{message}</Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.cancelButton,
                {
                  paddingVertical: scale(10),
                  paddingHorizontal: scale(20),
                  borderRadius: scale(5),
                  marginHorizontal: scale(5)
                }
              ]} 
              onPress={onCancel}
            >
              <Text style={[
                styles.cancelText,
                {
                  fontSize: conditionalScale(14, {
                    desktop: 16,
                    tablet: 15,
                    phone: 14,
                    smallPhone: 13
                  })
                }
              ]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                {
                  paddingVertical: scale(10),
                  paddingHorizontal: scale(20),
                  borderRadius: scale(5),
                  marginHorizontal: scale(5)
                }
              ]} 
              onPress={onConfirm}
            >
              <Text style={[
                styles.confirmText,
                {
                  fontSize: conditionalScale(14, {
                    desktop: 16,
                    tablet: 15,
                    phone: 14,
                    smallPhone: 13
                  })
                }
              ]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    textAlign: 'center'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    flex: 1,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#f0f0f0'
  },
  confirmButton: {
    backgroundColor: '#FF3B30'
  },
  cancelText: {
    color: '#333',
    fontWeight: '500'
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold'
  }
});