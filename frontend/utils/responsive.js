import { Dimensions, Platform } from 'react-native';
import { useEffect, useState } from 'react';

// Dimensiones base (basadas en un diseño de referencia)
const baseWidth = 375; // Ancho base de iPhone X
const baseHeight = 812; // Altura base de iPhone X

// Obtener dimensiones de pantalla actuales
const getScreenDimensions = () => {
  const window = Dimensions.get('window');
  return {
    width: window.width,
    height: window.height,
    screenWidth: Math.min(window.width, window.height), // El lado más corto
    screenHeight: Math.max(window.width, window.height), // El lado más largo
  };
};

// Factores de escala
const getDimScales = () => {
  const { screenWidth, screenHeight } = getScreenDimensions();
  return {
    widthScale: screenWidth / baseWidth,
    heightScale: screenHeight / baseHeight,
    moderateScale: Math.min(screenWidth / baseWidth, screenHeight / baseHeight),
  };
};

// Funciones de escalado
export const scale = (size) => {
  const { moderateScale } = getDimScales();
  return Math.round(moderateScale * size);
};

export const verticalScale = (size) => {
  const { heightScale } = getDimScales();
  return Math.round(heightScale * size);
};

export const horizontalScale = (size) => {
  const { widthScale } = getDimScales();
  return Math.round(widthScale * size);
};

// Función para escalar manteniendo compatibilidad con tu actual estructura condicional
export const conditionalScale = (size, options = {}) => {
  const { screenWidth } = getScreenDimensions();
  
  const {
    desktop = size * 1.3,
    tablet = size * 1.2,
    largePhone = size * 1.1,
    phone = size,
    smallPhone = size * 0.85
  } = options;
  
  if (screenWidth >= 1024) return desktop;
  if (screenWidth >= 768) return tablet;
  if (screenWidth >= 480) return largePhone;
  if (screenWidth >= 400) return phone;
  return smallPhone;
};

// Reutilizamos tu función getDeviceType existente
export const getDeviceType = () => {
  const { screenWidth } = getScreenDimensions();
  
  if (screenWidth < 400) return "small-phone";
  if (screenWidth < 480) return "phone";
  if (screenWidth < 768) return "large-phone";
  if (screenWidth < 1024) return "tablet";
  return "desktop";
};

// Reutilizamos tu función hasNotch existente
export const hasNotch = () => {
  const { width, height } = getScreenDimensions();
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((height >= 812 && width >= 375) || (width >= 812 && height >= 375))
  );
};

// Hook para detectar la orientación
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(() => {
    const { width, height } = getScreenDimensions();
    return width > height ? 'LANDSCAPE' : 'PORTRAIT';
  });

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = getScreenDimensions();
      setOrientation(width > height ? 'LANDSCAPE' : 'PORTRAIT');
    };
    
    const subscription = Dimensions.addEventListener('change', updateOrientation);
    return () => subscription.remove();
  }, []);

  return orientation;
};

// Hook para escuchar cambios en las dimensiones de la pantalla
export const useDimensions = () => {
  const [dimensions, setDimensions] = useState(getScreenDimensions());
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions(getScreenDimensions());
    };
    
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, []);
  
  return dimensions;
};