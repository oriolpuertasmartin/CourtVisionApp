import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

const StatsButtons = ({ onStatPress }) => {
    const buttons = [
        { label: '1pt', color: '#58E053', stat: '1ptmade', enabled: true }, // Verde
        { label: '1pt', color: '#F15656', stat: '1ptmiss', enabled: false }, // Rojo
        { label: '2pt', color: '#58E053', stat: '2ptmade', enabled: true }, // Verde
        { label: '2pt', color: '#F15656', stat: '2ptmiss', enabled: false }, // Rojo
        { label: '3pt', color: '#58E053', stat: '3ptmade', enabled: true }, // Verde
        { label: '3pt', color: '#F15656', stat: '3ptmiss', enabled: false }, // Rojo
        { label: 'STL', color: '#D6B400', stat: 'steals', enabled: true },
        { label: 'ASS', color: '#D6B400', stat: 'assists', enabled: true },
        { label: 'BLK', color: '#D6B400', stat: 'blocks', enabled: true },
        { label: 'DEF REB', color: '#D6B400', stat: 'defRebounds', enabled: true },
        { label: 'OFF REB', color: '#D6B400', stat: 'offRebounds', enabled: true },
        { label: 'TURN', color: '#D6B400', stat: 'turnovers', enabled: true },
        { label: 'FOUL', color: '#545EF4', stat: 'fouls', enabled: true },
        { label: 'SUB', color: '#EC37EF', stat: 'substitutions', enabled: true },
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
                            onPress={() => onStatPress(button.stat)} // Llama a la función con la estadística correspondiente
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
        width: 90,                 // Ancho y alto iguales para que sea círculo
        height: 90,                // Mismo valor que width
        borderRadius: 45,          // La mitad del ancho para hacer círculo perfecto
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