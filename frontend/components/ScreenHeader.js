import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubpageTitle from './SubpageTitle';
import HeaderTitle from './HeaderTitle';
import { useDeviceType } from './ResponsiveUtils';

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
    if (screenWidth > 1024) return 28; // desktop
    if (screenWidth > 768) return 26;  // tablet
    if (screenWidth > 480) return 24;  // phone
    return 22; // small-phone
  };
  
  // Ajustar posición según tipo de dispositivo
  const getButtonPosition = () => {
    // Para dispositivos iOS con notch o Dynamic Island
    const hasNotch = Platform.OS === 'ios' && 
      !Platform.isPad && 
      ((screenWidth >= 375 && Dimensions.get('window').height >= 812) || 
       (screenWidth >= 812 && Dimensions.get('window').height >= 375));
       
    if (hasNotch) return { top: 50 };
    if (screenWidth > 768) return { top: 40 };
    return { top: 35 };
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
    left: 20,
    zIndex: 10,
    padding: 10,
  }
});