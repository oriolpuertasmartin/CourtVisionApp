import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function BoxSelector({ title, items, onSelect, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.box}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {items.map((item, index) => (
            <TouchableOpacity 
              key={item._id || index} 
              style={styles.itemButton}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.itemButtonText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Contenedor para el children con estilos centralizados */}
        <View style={styles.childrenContainer}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 44,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  box: {
    width: '90%',
    minHeight: 350,
    maxHeight: 500, 
    backgroundColor: '#E6E0CE',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    elevation: 3,
  },
  scrollContainer: {
    flexGrow: 1, // Asegura que el contenedor interno ocupe todo el ancho
    alignItems: 'center', // Centra los elementos horizontalmente
    paddingHorizontal: 15, // Espacio adicional en los laterales
  },
  itemButton: {
    backgroundColor: '#FFF9E7',
    paddingVertical: 20,
    marginBottom: 20, // Más espacio entre los botones
    borderRadius: 8,
    width: '95%', // Reduce un poco el ancho para dar espacio en los laterales
  },
  itemButtonText: {
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '600',
  },
  childrenContainer: {
    marginTop: 20, // Espacio entre el scroll y el children
    alignItems: 'center', // Centra horizontalmente el children
    width: '95%', // Asegura que el children tenga el mismo ancho que los botones
    paddingVertical: 15,
  },
});