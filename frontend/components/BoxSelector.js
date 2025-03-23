import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BoxSelector({ title, items, onSelect, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.box}>
        {items.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.itemButton}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.itemButtonText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
        {children}
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
    width: '70%',
    minHeight: 350,
    backgroundColor: '#E6E0CE',
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 10,
    elevation: 3,
    alignItems: 'center',
  },
  itemButton: {
    backgroundColor: '#FFF9E7',
    paddingVertical: 35,
    marginBottom: 30,
    borderRadius: 8,
    width: '90%',
  },
  itemButtonText: {
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '600',
  },
});