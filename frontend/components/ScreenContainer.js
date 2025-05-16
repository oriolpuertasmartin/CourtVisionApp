import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useDeviceType } from './ResponsiveUtils';

export default function ScreenContainer({ 
  children, 
  scrollable = true, 
  style = {},
  contentContainerStyle = {},
  fullWidth = false,
  noTopPadding = false
}) {
  const deviceType = useDeviceType();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  
  // Detectar cambios en las dimensiones de la pantalla
  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions(Dimensions.get('window'));
    };
    
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, []);
  
  // Detectar si es un iPhone con notch o Dynamic Island
  const hasNotch = () => {
    if (Platform.OS !== 'ios') return false;
    
    const { height, width } = screenDimensions;
    return (
      !Platform.isPad &&
      !Platform.isTV &&
      ((height >= 812 && width >= 375) || (width >= 812 && height >= 375))
    );
  };
  
  // Calcular el padding superior según el dispositivo
  const getTopPadding = () => {
    if (noTopPadding) return 0;
    
    if (Platform.OS === 'ios') {
      if (hasNotch()) return 50;
      return 40;
    }
    
    if (Platform.OS === 'android') {
      return StatusBar.currentHeight + 20 || 40;
    }
    
    // Para web, un padding que se ve bien en la mayoría de navegadores
    return deviceType === 'desktop' ? 60 : deviceType === 'tablet' ? 50 : 40;
  };
  
  // Calcular el ancho máximo basado en la plataforma, el dispositivo y el parámetro fullWidth
  const getMaxWidth = () => {
    if (Platform.OS !== 'web') return '100%';
    
    const { width: windowWidth } = screenDimensions;
    
    if (fullWidth) {
      // Para pantallas que necesitan más espacio horizontal (StatsScreen, TeamPlayersScreen, etc.)
      if (windowWidth > 1600) return '80%';
      if (windowWidth > 1200) return '85%';
      if (windowWidth > 900) return '90%';
      return '95%';
    } else {
      // Para pantallas con contenido más condensado
      if (windowWidth > 1600) return 1200;
      if (windowWidth > 1200) return 1000;
      if (windowWidth > 900) return 850;
      return 800;
    }
  };
  
  // Calcular el padding horizontal según el tamaño de pantalla
  const getHorizontalPadding = () => {
    if (Platform.OS !== 'web') {
      return deviceType === 'mobile' ? 15 : 20;
    }
    
    const { width } = screenDimensions;
    if (width < 480) return 15;
    if (width < 768) return 20;
    if (width < 1024) return 30;
    return 40;
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
    paddingBottom: 30,
    width: '100%',
    alignSelf: 'center',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 30,
    width: '100%',
    alignSelf: 'center',
  }
});