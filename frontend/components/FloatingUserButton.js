import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FloatingUserButton({ user, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.statusIndicator} />
      <View>
        <Text style={styles.text}>{user.username}</Text>
        <Text style={styles.subtext}>{user.email}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#D9D9D9',
    padding: 25,
    borderRadius: 20,
    elevation: 5,
  },
  statusIndicator: {
    width: 30,
    height: 30,
    borderRadius: 35,
    backgroundColor: '#33C56D',
    marginRight: 13,
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  subtext: {
    color: 'black',
    fontSize: 14,
  },
});