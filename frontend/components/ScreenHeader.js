import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubpageTitle from './SubpageTitle';

export default function ScreenHeader({ title, onBack, showBackButton = true }) {
  return (
    <>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      )}
      
      <SubpageTitle>{title}</SubpageTitle>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  }
});