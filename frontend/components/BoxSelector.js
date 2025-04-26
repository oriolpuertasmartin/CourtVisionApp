import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function BoxSelector({ title, items, onSelect, children, renderItemButtons, emptyMessage, customRenderItem }) {
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
              <View 
                key={item._id || index} 
                style={[
                  styles.itemContainer, 
                  index === 0 ? { marginTop: 10 } : null // Reducido de 20 a 10
                ]}
              >
                {customRenderItem ? (
                  // Usar renderizado personalizado si está disponible
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
                    
                    {/* Renderizar botones personalizados si se proporcionan */}
                    {renderItemButtons && renderItemButtons(item)}
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>
        
        {/* Children va fuera de ScrollView */}
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
    width: '95%', // Cambiado de 80% a 95% para usar más espacio horizontal
    marginTop: 0, // Cambiado de 20 a 0 para eliminar el espacio superior
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  box: {
    width: '100%',
    maxHeight: 'auto', // Eliminado el límite máximo de altura
    backgroundColor: '#E6E0CE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
    flex: 1, // Añadido para que ocupe todo el espacio disponible
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 10, // Añadido para dar espacio al contenido inferior
  },
  itemContainer: {
    width: '98%', // Cambiado de 95% a 98% para usar más espacio
    marginBottom: 15,
  },
  itemButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 8,
    paddingHorizontal: 15,
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
    marginTop: 10,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
});