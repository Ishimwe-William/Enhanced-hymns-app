import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "../../context/ThemeContext";

const FloatingButton = ({
                            name,
                            size = 24,
                            color = '#666',
                            onPress,
                            style,
                            compact = false, // New prop for extra compact mode
                            disabled = false
                        }) => {
    const {colors} = useTheme().theme;

    // Dynamic sizing based on compact prop
    const buttonSize = compact ? 30 : 38; // Smaller when compact
    const borderRadius = buttonSize / 2;

    const styles = StyleSheet.create({
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            width: buttonSize,
            height: buttonSize,
            borderRadius: borderRadius,
            backgroundColor: disabled ? colors.surface : colors.primary,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: disabled ? 0 : 1,
            },
            shadowOpacity: disabled ? 0 : 0.1,
            shadowRadius: disabled ? 0 : 2,
            elevation: disabled ? 0 : 2,
            opacity: disabled ? 0.5 : 1,
        },
    });

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={disabled ? null : onPress}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
        >
            <Ionicons
                name={name}
                size={size}
                color={disabled ? colors.textSecondary : color}
            />
        </TouchableOpacity>
    );
};

export default FloatingButton;
