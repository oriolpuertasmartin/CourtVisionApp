import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function BoxSelector({ title, items, onSelect, children, renderItemButtons, emptyMessage, customRenderItem }) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.box}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={true} // Mostrar indicador de scroll
        >
          {items.length === 0 ? (
            <Text style={styles.emptyMessage}>{emptyMessage || "No items found"}</Text>
          ) : (
            items.map((item, index) => (
              <View 
                key={item._id || index} 
                style={[
                  styles.itemContainer, 
                  index === 0 ? { marginTop: 10 } : null
                ]}
              >
                {customRenderItem ? (
                  customRenderItem(item)
                ) : (
                  <>
                    <TouchableOpacity 
                      style={[styles.itemButton, item.style]}
                      onPress={() => onSelect(item)}
                    >
                      <Text style={styles.itemButtonText}>{item.name}</Text>
                      {item.subtitle && (
                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                      )}
                    </TouchableOpacity>
                    
                    {renderItemButtons && renderItemButtons(item)}
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>
        
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
    width: '95%',
    marginTop: 50, 
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  box: {
    width: '100%',
    maxHeight: 750, 
    backgroundColor: '#E6E0CE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  itemContainer: {
    width: '98%',
    marginBottom: 15,
  },
  itemButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 8,
    paddingHorizontal: 25,
  },
  itemButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  childrenContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30, 
    marginBottom: 10, 
    paddingHorizontal: 5, 
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
});