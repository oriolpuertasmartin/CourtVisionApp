import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useDeviceType } from './ResponsiveUtils';

export default function BoxSelector({ title, items, onSelect, children, renderItemButtons, emptyMessage, customRenderItem }) {
  const deviceType = useDeviceType();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Actualizar dimensiones cuando cambie el tamaño de la pantalla
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get('window').width);
    };
    
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, []);

  // Determinar el margen superior según tamaño de pantalla
  const getMarginTop = () => {
    if (screenWidth < 480) return 10; // Menos margen en móviles pequeños
    if (screenWidth < 768) return 15; // Margen medio para móviles grandes
    return 20; // Margen normal para tablets y desktop
  };

  // Determinar la altura máxima del contenedor según la pantalla
  const getMaxHeight = () => {
    if (screenWidth < 480) return 450; // Altura para móviles pequeños
    if (screenWidth < 768) return 550; // Altura para móviles grandes
    if (screenWidth < 1024) return 650; // Altura para tablets
    return 750; // Altura para desktop
  };
  
  // Determinar el padding vertical según la pantalla
  const getPaddingVertical = () => {
    if (screenWidth < 480) return 8; // Menos espacio en móviles pequeños
    if (screenWidth < 768) return 10; // Espacio medio en móviles grandes
    return 12; // Espacio normal en tablets y desktop
  };

  // Determinar el padding horizontal según la pantalla
  const getPaddingHorizontal = () => {
    if (screenWidth < 480) return 8; // Menos espacio en móviles pequeños
    if (screenWidth < 768) return 10; // Espacio medio en móviles grandes
    return 12; // Espacio normal en tablets y desktop
  };

  return (
    <View style={[
      styles.container,
      { marginTop: getMarginTop() }
    ]}>
      {title && (
        <Text style={[
          styles.title,
          screenWidth < 480 && { fontSize: 20, marginBottom: 15 }
        ]}>
          {title}
        </Text>
      )}
      
      <View style={[
        styles.box,
        { maxHeight: getMaxHeight() }
      ]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={true}
        >
          {items.length === 0 ? (
            <Text style={styles.emptyMessage}>{emptyMessage || "No items found"}</Text>
          ) : (
            items.map((item, index) => (
              <View 
                key={item._id || index} 
                style={[
                  styles.itemContainer, 
                  index === 0 ? { marginTop: 8 } : null,
                  index === items.length - 1 ? { marginBottom: 8 } : null
                ]}
              >
                {customRenderItem ? (
                  customRenderItem(item)
                ) : (
                  <>
                    <TouchableOpacity 
                      style={[
                        styles.itemButton,
                        item.style,
                        { 
                          paddingVertical: getPaddingVertical(),
                          paddingHorizontal: getPaddingHorizontal() 
                        }
                      ]}
                      onPress={() => onSelect(item)}
                    >
                      <Text style={[
                        styles.itemButtonText,
                        screenWidth < 480 && { fontSize: 16 }
                      ]}>
                        {item.name}
                      </Text>
                      
                      {item.subtitle && (
                        <Text style={[
                          styles.itemSubtitle,
                          screenWidth < 480 && { fontSize: 12, marginTop: 3 }
                        ]}>
                          {item.subtitle}
                        </Text>
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
          <View style={[
            styles.childrenContainer,
            screenWidth < 480 ? { marginTop: 20 } : 
            screenWidth < 768 ? { marginTop: 25 } : { marginTop: 30 }
          ]}>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  box: {
    width: '100%',
    backgroundColor: '#E6E0CE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  itemContainer: {
    width: '98%',
    marginBottom: 12,
  },
  itemButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 8,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333333',
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
    marginBottom: 10, 
    paddingHorizontal: 5, 
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
    fontStyle: 'italic',
  },
});