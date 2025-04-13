import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export function useOrientation() {
  const [orientation, setOrientation] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    // Suscribirse al evento de cambio de dimensiones
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    // Limpiar la suscripción
    return () => {
      // Para react-native < 0.65:
      // Dimensions.removeEventListener('change', updateOrientation);
      
      // Para react-native >= 0.65:
      subscription.remove();
    };
  }, []);

  return orientation;
}