import React from "react";
import { View, Text, TextInput, StyleSheet, Dimensions } from "react-native";
import { scale, conditionalScale, getDeviceType } from "../utils/responsive";
import { useDeviceType } from "./ResponsiveUtils";

const BoxFill = ({ 
  title, 
  fields, 
  formData, 
  onChangeForm, 
  children, 
  containerStyle = {} 
}) => {
  // Obtener el tipo de dispositivo actual
  const deviceType = getDeviceType();
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 480;
  const isLargeScreen = screenWidth > 768;

  // Calcular tamaños responsivos de forma proporcional
  const getTitleSize = () => {
    return conditionalScale(24, {
      desktop: 32,
      tablet: 28,
      phone: 24,
      smallPhone: 20
    });
  };

  const getFormWidth = () => {
    if (isLargeScreen) return "75%";
    if (screenWidth > 480) return "85%";
    return "90%";
  };

  const getContainerWidth = () => {
    if (isLargeScreen) return "85%";
    if (screenWidth > 480) return "90%";
    return "95%";
  };
  
  // Calcular el padding proporcional al tamaño de la pantalla
  const getFormPadding = () => {
    return {
      vertical: conditionalScale(20, {
        desktop: 30,
        tablet: 25,
        phone: 20,
        smallPhone: 15
      }),
      horizontal: conditionalScale(15, {
        desktop: 25,
        tablet: 20,
        phone: 18,
        smallPhone: 15
      })
    };
  };
  
  const padding = getFormPadding();

  return (
    <View style={[
      styles.container, 
      { 
        width: getContainerWidth(),
        marginVertical: conditionalScale(15, {
          desktop: 20,
          tablet: 18,
          phone: 15,
          smallPhone: 10
        })
      },
      containerStyle
    ]}>
      {title && (
        <Text style={[
          styles.title, 
          { 
            fontSize: getTitleSize(),
            marginBottom: conditionalScale(15, {
              desktop: 20,
              tablet: 18,
              phone: 15,
              smallPhone: 10
            })
          }
        ]}>
          {title}
        </Text>
      )}
      
      <View style={[
        styles.form,
        { 
          width: getFormWidth(),
          paddingVertical: padding.vertical,
          paddingHorizontal: padding.horizontal,
          borderRadius: scale(12)
        }
      ]}>
        {fields.map((field) => (
          <TextInput
            key={field.name}
            style={[
              styles.input,
              field.style,
              {
                height: conditionalScale(35, {
                  desktop: 45,
                  tablet: 40,
                  phone: 38,
                  smallPhone: 35
                }),
                marginBottom: conditionalScale(15, {
                  desktop: 20,
                  tablet: 18,
                  phone: 15,
                  smallPhone: 12
                }),
                fontSize: conditionalScale(14, {
                  desktop: 16,
                  tablet: 15,
                  phone: 14,
                  smallPhone: 12
                }),
                paddingHorizontal: scale(10),
                borderRadius: scale(8)
              }
            ]}
            placeholder={field.placeholder}
            placeholderTextColor="gray"
            value={formData[field.name] || ""}
            onChangeText={(text) =>
              onChangeForm({ ...formData, [field.name]: text })
            }
          />
        ))}
        {children}
      </View>
    </View>
  );
};

export default BoxFill;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  form: {
    backgroundColor: "#E6E0CE",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderColor: "gray",
    backgroundColor: "#FFF9E7",
    color: "gray",
  },
});