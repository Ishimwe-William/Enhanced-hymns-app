import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "../../context/ThemeContext";

const FloatingButton = ({ name, size = 28, color = '#666', onPress, style }) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.primary,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
    });

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons
                name={name}
                size={size}
                color={color}
            />
        </TouchableOpacity>
    );
};


export default FloatingButton;
