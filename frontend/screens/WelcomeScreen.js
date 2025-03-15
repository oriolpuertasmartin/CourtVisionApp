import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function Portada() {
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      <Text style={styles.principalText}>Bienvenid@ a CourtVision</Text>
      <View style={styles.box}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  principalText: {
    fontSize: 40,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  box: {
      margin: 50,
      backgroundColor: 'white',
      borderRadius: 20,
      width: "30%",
      padding: 35,
      shadowColor: 'black',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    boxinside: {
      paddingVertical: 20,
      backgroundColor: "#cccccc40",
      borderRadius: 30,
      marginVertical: 10,
    },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500',
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
    fontWeight: 'bold',
  },
  secondaryText: {
    fontSize: 20,
    color: 'white',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
});