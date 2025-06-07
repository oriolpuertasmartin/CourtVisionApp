import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubpageTitle from './SubpageTitle';
import HeaderTitle from './HeaderTitle';
import { useDeviceType } from './ResponsiveUtils';
import { scale, conditionalScale } from '../utils/responsive';

export default function ScreenHeader({ 
  title, 
  onBack, 
  showBackButton = true, 
  customStyle = {},
  iconSize,
  iconColor = "black",
  isMainScreen = false // <- Nuevo parámetro para indicar si es pantalla principal
}) {
  const deviceType = useDeviceType();
  const screenWidth = Dimensions.get('window').width;
  
  // Determinar el tamaño del icono según el dispositivo
  const getIconSize = () => {
    if (iconSize) return iconSize;
    
    // Usando conditionalScale para simplificar la lógica
    return conditionalScale(24, {
      desktop: 28,
      tablet: 26,
      phone: 24,
      smallPhone: 22
    });
  };
  
  // Ajustar posición según tipo de dispositivo
  const getButtonPosition = () => {
    // Para dispositivos iOS con notch o Dynamic Island
    const hasNotch = Platform.OS === 'ios' && 
      !Platform.isPad && 
      ((screenWidth >= 375 && Dimensions.get('window').height >= 812) || 
       (screenWidth >= 812 && Dimensions.get('window').height >= 375));
       
    if (hasNotch) return { top: scale(50) };
    if (screenWidth > 768) return { top: scale(40) };
    return { top: scale(35) };
  };

  return (
    <>
      {showBackButton && (
        <TouchableOpacity
          style={[
            styles.backButton,
            getButtonPosition(),
            customStyle
          ]}
          onPress={onBack}
          accessibilityLabel="Volver atrás"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={getIconSize()} color={iconColor} />
        </TouchableOpacity>
      )}
      
      {/* Usar HeaderTitle para pantallas principales o SubpageTitle para subpantallas */}
      {isMainScreen ? (
        <HeaderTitle>{title}</HeaderTitle>
      ) : (
        <SubpageTitle>{title}</SubpageTitle>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    left: scale(20),
    zIndex: 10,
    padding: scale(10),
  }
});