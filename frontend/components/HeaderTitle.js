import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { useDeviceType } from './ResponsiveUtils';

export default function HeaderTitle({ children, customStyle = {} }) {
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

  // Determinar tamaño de fuente según el dispositivo/tamaño de pantalla
  const getFontSize = () => {
    if (screenWidth < 360) return 26; // Teléfonos muy pequeños (reducido de 32)
    if (screenWidth < 480) return 28; // Teléfonos pequeños (reducido de 36)
    if (screenWidth < 768) return 34; // Teléfonos grandes (reducido de 40)
    if (screenWidth < 1024) return 42; // Tablets (sin cambios)
    return 45; // Desktop o tablets grandes (sin cambios)
  };

  // Determinar el margen inferior según el dispositivo - REDUCIDO
  const getMarginBottom = () => {
    if (screenWidth < 360) return 5; // Reducido de 10 a 5
    if (screenWidth < 480) return 8; // Reducido de 15 a 8
    if (screenWidth < 768) return 12; // Reducido de 20 a 12
    return 20; // Reducido de 30 a 20 para tablets y desktop
  };

  // Determinar el padding horizontal según el dispositivo
  const getPaddingHorizontal = () => {
    if (screenWidth < 360) return 10; // Más compacto para teléfonos muy pequeños
    if (screenWidth < 480) return 15; // Reducido para teléfonos pequeños
    return 20; // Valor original para dispositivos más grandes
  };

  // Determinar el margen superior según el dispositivo - REDUCIDO
  const getMarginTop = () => {
    if (screenWidth < 480) return 2; // Reducido de 5 a 2
    if (screenWidth < 768) return 5; // Reducido de 10 a 5
    return 10; // Reducido de 15 a 10 para tablets y desktop
  };

  return (
    <Text 
      style={[
        styles.headerTitle, 
        { 
          fontSize: getFontSize(),
          marginBottom: getMarginBottom(),
          marginTop: getMarginTop(),
          paddingHorizontal: getPaddingHorizontal(),
          // Ajustar espaciado entre letras en pantallas pequeñas
          letterSpacing: screenWidth < 480 ? -0.5 : 0,
        },
        customStyle
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center",
    color: "#333333",
  },
});