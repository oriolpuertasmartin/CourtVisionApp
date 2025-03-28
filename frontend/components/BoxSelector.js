import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function BoxSelector({ title, items, onSelect, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.box}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          {items.map((item, index) => (
            <TouchableOpacity 
              key={item._id || index} 
              style={[styles.itemButton, item.style]}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.itemButtonText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Children ahora va FUERA del ScrollView */}
        {children && (
          <View style={styles.childrenContainer}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
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
    maxHeight: 300,
    backgroundColor: '#E6E0CE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  itemButton: {
    backgroundColor: '#FFF9E7',
    paddingVertical: 20,
    marginBottom: 10,
    borderRadius: 8,
    width: '95%',
    alignItems: 'center',
  },
  itemButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  childrenContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
});