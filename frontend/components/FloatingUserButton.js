import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FloatingUserButton({ user, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{user.username}</Text>
      <Text style={styles.subtext}>{user.email}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#808080', // gray color
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  subtext: {
    color: 'white',
    fontSize: 12,
  },
});