import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function Portada() {
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      <Text>Bienvenid@ a CourtVision</Text>

      <View style={styles.mainbuttonbox}>
        <TouchableOpacity
          style={styles.buttonbox}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttontext}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mainbuttonbox}>
        <TouchableOpacity
          style={styles.buttonbox}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttontext}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  mainbuttonbox: {
    alignItems: 'center',
  },
  buttonbox: {
    backgroundColor: '#FFA500',
    borderRadius: 30,
    paddingVertical: 20,
    width: 150,
    marginTop: 20,
  },
  buttontext: {
    textAlign: 'center',
    color: 'white',
  },
});