import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

// Determinar si es móvil, tablet o desktop basado en el ancho
export function useDeviceType() {
  const [deviceSize, setDeviceSize] = useState(getDeviceSize());

  function getDeviceSize() {
    const { width } = Dimensions.get('window');
    if (width < 480) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  useEffect(() => {
    const updateDeviceSize = () => {
      setDeviceSize(getDeviceSize());
    };

    const subscription = Dimensions.addEventListener('change', updateDeviceSize);
    return () => subscription.remove();
  }, []);

  return deviceSize;
}

// Obtener dimensiones de la pantalla
export function useScreenDimensions() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription.remove();
  }, []);

  return dimensions;
}

// Constantes de referencia para diseño
const BASE_WIDTH = 375; // iPhone X width como referencia

// Hook para escalar medidas de acuerdo al ancho de pantalla
export function useScale() {
  const { width } = useScreenDimensions();
  const scale = width / BASE_WIDTH;
  
  // Aseguramos que en móviles no sea menor que 0.8 y en tablets/desktop no mayor que 1.5
  const normalizedScale = Math.min(Math.max(scale, 0.8), 1.5);
  
  return (size) => Math.round(size * normalizedScale);
}