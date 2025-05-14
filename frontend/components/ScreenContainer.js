import React from 'react';
import { View, StyleSheet, Platform, ScrollView, Dimensions } from 'react-native';

export default function ScreenContainer({ 
  children, 
  scrollable = true, 
  style = {},
  contentContainerStyle = {},
  fullWidth = false 
}) {
  
  // Calcular el ancho máximo basado en la plataforma y el parámetro fullWidth
  const getMaxWidth = () => {
    if (Platform.OS !== 'web') return '100%';
    
    // Valores de ancho consistentes para todas las pantallas
    const windowWidth = Dimensions.get('window').width;
    
    if (fullWidth) {
      // Para pantallas que necesitan más espacio horizontal
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

  const maxWidth = getMaxWidth();
  
  if (scrollable) {
    return (
      <View style={[styles.outerContainer, style]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent, 
            { maxWidth },
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
      <View style={[styles.innerContainer, { maxWidth }, contentContainerStyle]}>
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
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    width: '100%',
    alignSelf: 'center',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    width: '100%',
    alignSelf: 'center',
  }
});