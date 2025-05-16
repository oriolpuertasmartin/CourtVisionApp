import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { useDeviceType } from './ResponsiveUtils';

export default function SubpageTitle({ children, customStyle = {} }) {
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
    if (screenWidth < 360) return 24; // Teléfonos muy pequeños
    if (screenWidth < 480) return 28; // Teléfonos pequeños
    if (screenWidth < 768) return 30; // Teléfonos grandes
    if (screenWidth < 1024) return 32; // Tablets
    return 36; // Desktop o tablets grandes
  };

  // Determinar el margen inferior según el dispositivo
  const getMarginBottom = () => {
    if (screenWidth < 480) return 15;
    if (screenWidth < 768) return 20;
    return 25; // Valor original
  };

  // Determinar el margen superior según el dispositivo
  const getMarginTop = () => {
    if (screenWidth < 480) return 5;
    if (screenWidth < 768) return 8;
    return 10; // Valor original
  };

  return (
    <Text 
      style={[
        styles.subpageTitle, 
        { 
          fontSize: getFontSize(),
          marginBottom: getMarginBottom(),
          marginTop: getMarginTop(),
        },
        customStyle
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  subpageTitle: {
    fontWeight: "600",
    alignSelf: "center",
    color: "#333333",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});