import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useDeviceType } from './ResponsiveUtils';
import { scale, conditionalScale, getDeviceType } from '../utils/responsive';

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
    return conditionalScale(10, {
      desktop: 20,
      tablet: 15,
      phone: 12,
      smallPhone: 10
    });
  };

  // Determinar la altura máxima del contenedor según la pantalla
  const getMaxHeight = () => {
    return conditionalScale(450, {
      desktop: 750,
      tablet: 650, 
      phone: 550,
      smallPhone: 450
    });
  };

  // Calcular el espaciado entre elementos de forma proporcional
  const getItemSpacing = () => {
    return conditionalScale(8, {
      desktop: 10,
      tablet: 9,
      phone: 8,
      smallPhone: 6
    });
  };

  return (
    <View style={[
      styles.container,
      { marginTop: getMarginTop() }
    ]}>
      {title && (
        <Text style={[
          styles.title,
          {
            fontSize: conditionalScale(20, {
              desktop: 24,
              tablet: 22,
              phone: 20,
              smallPhone: 18
            }),
            marginBottom: scale(15)
          }
        ]}>
          {title}
        </Text>
      )}
      
      <View style={[
        styles.box,
        { maxHeight: getMaxHeight() }
      ]}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: getItemSpacing() }
          ]} 
          showsVerticalScrollIndicator={true}
        >
          {items.length === 0 ? (
            <Text style={[
              styles.emptyMessage,
              {
                fontSize: conditionalScale(16, {
                  desktop: 18,
                  tablet: 17,
                  phone: 16,
                  smallPhone: 14
                }),
                padding: scale(20)
              }
            ]}>{emptyMessage || "No items found"}</Text>
          ) : (
            items.map((item, index) => (
              <View 
                key={item._id || index} 
                style={[
                  styles.itemContainer, 
                  {
                    marginBottom: index === items.length - 1 ? 0 : getItemSpacing(),
                    marginTop: index === 0 ? getItemSpacing() / 2 : 0
                  }
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
                          paddingVertical: conditionalScale(8, {
                            desktop: 15,
                            tablet: 12,
                            phone: 10,
                            smallPhone: 8
                          }),
                          paddingHorizontal: conditionalScale(10, {
                            desktop: 20,
                            tablet: 16,
                            phone: 14,
                            smallPhone: 10
                          }),
                          borderRadius: scale(8)
                        }
                      ]}
                      onPress={() => onSelect(item)}
                    >
                      <Text style={[
                        styles.itemButtonText,
                        {
                          fontSize: conditionalScale(16, {
                            desktop: 18,
                            tablet: 17,
                            phone: 16,
                            smallPhone: 14
                          })
                        }
                      ]}>
                        {item.name}
                      </Text>
                      
                      {item.subtitle && (
                        <Text style={[
                          styles.itemSubtitle,
                          {
                            fontSize: conditionalScale(12, {
                              desktop: 14,
                              tablet: 13,
                              phone: 12,
                              smallPhone: 10
                            }),
                            marginTop: scale(3)
                          }
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
            {
              marginTop: conditionalScale(15, {
                desktop: 20,
                tablet: 18, 
                phone: 15,
                smallPhone: 12
              }),
              paddingHorizontal: scale(5)
            }
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
    width: conditionalScale('95%', {
      desktop: '90%',
      tablet: '92%',
      phone: '95%',
      smallPhone: '98%'
    }),
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  box: {
    width: '100%',
    backgroundColor: '#E6E0CE',
    borderRadius: scale(12),
    paddingVertical: scale(8),
    paddingHorizontal: scale(8),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  itemContainer: {
    width: '98%',
  },
  itemButton: {
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemButtonText: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#333333',
  },
  itemSubtitle: {
    color: '#666',
    textAlign: 'center',
  },
  childrenContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});