import { Platform } from 'react-native';

// La dirección IP debe ser la misma que aparece en tu mensaje de Metro
// › Metro waiting on exp://192.168.1.143:8081
const LOCAL_IP = '192.168.1.143';

let API_BASE_URL = '';

if (Platform.OS === 'web') {
  // Para desarrollo web
  API_BASE_URL = 'http://localhost:3001';
} else if (Platform.OS === 'ios') {
  // Para emulador/dispositivo iOS
  // En iOS debemos usar la IP completa, ya que localhost apunta al propio dispositivo
  API_BASE_URL = `http://${LOCAL_IP}:3001`;
} else if (Platform.OS === 'android') {
  // Para emulador Android (10.0.2.2 es el localhost de la máquina host)
  API_BASE_URL = 'http://10.0.2.2:3001';
} else {
  // Para cualquier otro caso, usamos la IP local
  API_BASE_URL = `http://${LOCAL_IP}:3001`;
}

console.log(`[API Config] Plataforma: ${Platform.OS}, URL API: ${API_BASE_URL}`);

export default API_BASE_URL;