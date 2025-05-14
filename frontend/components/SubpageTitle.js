import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function SubpageTitle({ children }) {
  return <Text style={styles.subpageTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  subpageTitle: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 25,
    marginTop: 10,
    alignSelf: "center",
    color: "#333333",
  },
});