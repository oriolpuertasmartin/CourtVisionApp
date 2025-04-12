import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function BoxSelector({ title, items, onSelect, children, renderItemButtons, emptyMessage }) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.box}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <Text style={styles.emptyMessage}>{emptyMessage || "No items found"}</Text>
          ) : (
            items.map((item, index) => (
              <View key={item._id || index} style={styles.itemContainer}>
                <TouchableOpacity 
                  style={[styles.itemButton, item.style]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.itemButtonText}>{item.name}</Text>
                  {item.subtitle && (
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  )}
                </TouchableOpacity>
                
                {/* Renderizar botones personalizados si se proporcionan */}
                {renderItemButtons && renderItemButtons(item)}
              </View>
            ))
          )}
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
    width: '100%',
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
    maxHeight: 500, // Aumentado para dar más espacio
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
  itemContainer: {
    width: '95%',
    marginBottom: 15,
  },
  itemButton: {
    backgroundColor: '#FFF9E7',
    paddingVertical: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  itemButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  childrenContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  emptyMessage: {
    textAlign: 'center',
    paddingVertical: 30,
    fontSize: 16,
    color: '#888',
  },
});