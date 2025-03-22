import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BoxSelector({ title, items, onSelect }) {
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
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  box: {
    width: '100%',
    backgroundColor: '#E6E0CE',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    elevation: 3,
  },
  itemButton: {
    backgroundColor: '#FFF9E7',
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});