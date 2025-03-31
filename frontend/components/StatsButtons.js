import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

const StatsButtons = () => {
    const buttons = [
        { label: '1pt', color: '#58E053' },    
        { label: '1pt', color: '#F15656' },        
        { label: '2pt', color: '#58E053' },   
        { label: '2pt', color: '#F15656' },    
        { label: '3pt', color: '#58E053' },    
        { label: '3pt', color: '#F15656' },    
        { label: 'STL', color: '#D6B400' },    
        { label: 'ASS', color: '#D6B400' },    
        { label: 'BLK', color: '#D6B400' },    
        { label: 'DEF REB', color: '#D6B400' },
        { label: 'OFF REB', color: '#D6B400' },
        { label: 'TURN', color: '#D6B400' },   
        { label: 'FOUL', color: '#545EF4' },   
        { label: 'SUB', color: '#EC37EF' }     
    ];

    // Organiza los botones en pares
    const buttonPairs = [];
    for (let i = 0; i < buttons.length; i += 2) {
        if (i + 1 < buttons.length) {
            buttonPairs.push([buttons[i], buttons[i + 1]]);
        } else {
            buttonPairs.push([buttons[i]]);
        }
    }

    return (
        <View style={styles.container}>
            {buttonPairs.map((pair, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {pair.map((button, colIndex) => (
                        <TouchableOpacity 
                            key={`${rowIndex}-${colIndex}`} 
                            style={[styles.button, { backgroundColor: button.color }]}
                        > 
                            <Text style={styles.buttonText}>{button.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -170 },  // Ajustado para el nuevo ancho
            { translateY: -250 }   // Ajustado para centrar verticalmente
        ],
        width: 340,                // Ancho ajustado para dos columnas
        flexDirection: 'column',   // Ahora organizamos en columnas
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    row: {
        flexDirection: 'row',      // Cada fila contiene dos botones
        justifyContent: 'center',  // Cambiado de 'space-between' a 'center'
        width: '100%',             // La fila ocupa todo el ancho del contenedor
        marginBottom: 10,          // Espacio entre filas
    },
    button: {
        width: 80,                 // Ancho y alto iguales para que sea círculo
        height: 80,                // Mismo valor que width
        borderRadius: 40,          // La mitad del ancho para hacer círculo perfecto
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,       // Reducido de 5 a 2 para menos separación
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default StatsButtons;