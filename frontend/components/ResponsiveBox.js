import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getDeviceType, scale, conditionalScale } from '../utils/responsive';

/**
 * Componente que permite aplicar estilos responsivos basados en el tipo de dispositivo
 * sin necesidad de múltiples condicionales en el código.
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Elementos hijo a renderizar
 * @param {Object} props.style - Estilos base que se aplicarán siempre
 * @param {Object} props.desktop - Estilos específicos para dispositivos desktop
 * @param {Object} props.tablet - Estilos específicos para tablets
 * @param {Object} props.largePhone - Estilos específicos para teléfonos grandes
 * @param {Object} props.phone - Estilos específicos para teléfonos
 * @param {Object} props.smallPhone - Estilos específicos para teléfonos pequeños
 * @param {Object} props.landscape - Estilos específicos para orientación horizontal
 * @param {Object} props.portrait - Estilos específicos para orientación vertical
 * @param {string|number} props.padding - Padding que se aplicará automáticamente
 * @param {string|number} props.margin - Margin que se aplicará automáticamente
 * @param {string|number} props.width - Ancho responsivo (puede ser % o número escalado)
 * @param {string|number} props.height - Alto responsivo (puede ser % o número escalado) 
 */
const ResponsiveBox = ({ 
  children, 
  style = {}, 
  desktop, 
  tablet, 
  largePhone,
  phone,
  smallPhone,
  landscape,
  portrait,
  padding, 
  margin,
  width,
  height,
  ...props 
}) => {
  const deviceType = getDeviceType();
  const isLandscape = props.orientation === 'LANDSCAPE' || 
                     (props.dimensions && props.dimensions.width > props.dimensions.height);
  
  // Aplicar estilos condicionales según el dispositivo
  let deviceStyle = {};
  
  // Estilos basados en tipo de dispositivo
  if (smallPhone && deviceType === 'small-phone') {
    deviceStyle = { ...deviceStyle, ...smallPhone };
  } else if (phone && (deviceType === 'phone')) {
    deviceStyle = { ...deviceStyle, ...phone };
  } else if (largePhone && deviceType === 'large-phone') {
    deviceStyle = { ...deviceStyle, ...largePhone };
  } else if (tablet && deviceType === 'tablet') {
    deviceStyle = { ...deviceStyle, ...tablet };
  } else if (desktop && deviceType === 'desktop') {
    deviceStyle = { ...deviceStyle, ...desktop };
  }
  
  // Estilos basados en orientación
  if (landscape && isLandscape) {
    deviceStyle = { ...deviceStyle, ...landscape };
  } else if (portrait && !isLandscape) {
    deviceStyle = { ...deviceStyle, ...portrait };
  }
  
  // Procesamiento de padding
  let paddingStyle = {};
  if (padding !== undefined) {
    if (typeof padding === 'number') {
      paddingStyle.padding = scale(padding);
    } else {
      paddingStyle.padding = padding;
    }
  }
  
  // Procesamiento de margin
  let marginStyle = {};
  if (margin !== undefined) {
    if (typeof margin === 'number') {
      marginStyle.margin = scale(margin);
    } else {
      marginStyle.margin = margin;
    }
  }
  
  // Procesamiento de width
  let widthStyle = {};
  if (width !== undefined) {
    if (typeof width === 'number') {
      widthStyle.width = scale(width);
    } else {
      widthStyle.width = width; // Para porcentajes o 'auto'
    }
  }
  
  // Procesamiento de height
  let heightStyle = {};
  if (height !== undefined) {
    if (typeof height === 'number') {
      heightStyle.height = scale(height);
    } else {
      heightStyle.height = height; // Para porcentajes o 'auto'
    }
  }
  
  return (
    <View 
      style={[
        style, 
        deviceStyle,
        paddingStyle,
        marginStyle,
        widthStyle,
        heightStyle
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

/**
 * Función utilitaria para obtener un valor escalado según el tipo de dispositivo
 * @param {number} size - Tamaño base
 * @param {Object} options - Opciones de tamaño por tipo de dispositivo
 * @returns {number} - Tamaño escalado
 */
export const responsiveValue = (size, options = {}) => {
  return conditionalScale(size, options);
};

export default ResponsiveBox;