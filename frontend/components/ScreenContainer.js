import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ScrollView, StatusBar } from 'react-native';
import { scale, useDimensions, getDeviceType, hasNotch as checkHasNotch } from '../utils/responsive';

export default function ScreenContainer({ 
  children, 
  scrollable = true, 
  style = {},
  contentContainerStyle = {},
  fullWidth = false,
  noTopPadding = false
}) {
  // Usamos el hook de dimensiones de nuestras utilidades
  const dimensions = useDimensions();
  const deviceType = getDeviceType();
  
  // Calcular el padding superior según el dispositivo
  const getTopPadding = () => {
    if (noTopPadding) return 0;
    
    if (Platform.OS === 'ios') {
      if (checkHasNotch()) return scale(50);
      return scale(40);
    }
    
    if (Platform.OS === 'android') {
      return StatusBar.currentHeight ? StatusBar.currentHeight + scale(20) : scale(40);
    }
    
    // Para web, un padding que se ve bien en la mayoría de navegadores
    // Reducimos el padding en desktop para aprovechar mejor el espacio
    return deviceType === 'desktop' ? scale(40) : 
           deviceType === 'tablet' ? scale(50) : 
           scale(40);
  };
  
  // Calcular el ancho máximo basado en la plataforma, el dispositivo y el parámetro fullWidth
  const getMaxWidth = () => {
    if (Platform.OS !== 'web') return '100%';
    
    const { width: windowWidth } = dimensions;
    
    if (fullWidth) {
      // Para pantallas que necesitan más espacio horizontal - AUMENTADO para aprovechar más espacio
      if (windowWidth > 1600) return '90%'; // Aumentado de 80% a 90%
      if (windowWidth > 1200) return '92%'; // Aumentado de 85% a 92%
      if (windowWidth > 900) return '95%';  // Aumentado de 90% a 95%
      return '98%';                         // Aumentado de 95% a 98%
    } else {
      // Para pantallas con contenido más condensado - AUMENTADO para aprovechar más espacio
      if (windowWidth > 1600) return 1600;  // Aumentado de 1200 a 1600
      if (windowWidth > 1200) return 1200;  // Aumentado de 1000 a 1200
      if (windowWidth > 900) return 950;    // Aumentado de 850 a 950
      return 850;                           // Aumentado de 800 a 850
    }
  };
  
  // Calcular el padding horizontal según el tamaño de pantalla
  const getHorizontalPadding = () => {
    if (Platform.OS !== 'web') {
      // Mayor espacio en móvil para "respirar" mejor
      return deviceType === 'small-phone' ? scale(15) :
             deviceType === 'phone' ? scale(20) : scale(25);
    }
    
    const { width } = dimensions;
    // Reducimos el padding en desktop para aprovechar mejor el espacio
    if (width < 480) return scale(20);      // Aumentado de 15 a 20 para móviles pequeños
    if (width < 768) return scale(20);      // Sin cambios
    if (width < 1024) return scale(25);     // Reducido de 30 a 25
    return scale(30);                       // Reducido de 40 a 30
  };

  const maxWidth = getMaxWidth();
  const topPadding = getTopPadding();
  const horizontalPadding = getHorizontalPadding();
  
  // Estilos dinámicos basados en el dispositivo
  const dynamicScrollContentStyle = {
    paddingTop: topPadding,
    paddingHorizontal: horizontalPadding,
    maxWidth,
  };
  
  const dynamicInnerContainerStyle = {
    paddingTop: topPadding,
    paddingHorizontal: horizontalPadding,
    maxWidth,
  };
  
  if (scrollable) {
    return (
      <View style={[styles.outerContainer, style]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent, 
            dynamicScrollContentStyle,
            contentContainerStyle
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }
  
  return (
    <View style={[styles.outerContainer, style]}>
      <View 
        style={[
          styles.innerContainer, 
          dynamicInnerContainerStyle, 
          contentContainerStyle
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: scale(30),
    width: '100%',
    alignSelf: 'center',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: scale(30),
    width: '100%',
    alignSelf: 'center',
  }
});