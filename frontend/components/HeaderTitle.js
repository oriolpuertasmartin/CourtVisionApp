import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function HeaderTitle({ children }) {
  return <Text style={styles.headerTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 45,
    fontWeight: "bold",
    marginBottom: 30,
    alignSelf: "center",
  },
});