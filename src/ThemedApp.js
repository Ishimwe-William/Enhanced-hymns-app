import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    NavigationContainer,
    DefaultTheme as NavDefaultTheme,
    DarkTheme as NavDarkTheme,
} from '@react-navigation/native';
import { useTheme } from './context/ThemeContext';
import DrawerNavigator from './navigations/DrawerNavigator';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {  StyleSheet } from 'react-native';

export default function ThemedApp() {
    const { theme, themeMode } = useTheme();
    const colors = theme.colors;

    const navTheme = themeMode === 'dark'
        ? {
            ...NavDarkTheme,
            dark: true,
            colors: {
                ...NavDarkTheme.colors,
                ...colors, // overrides all with your custom theme
            },
        }
        : {
            ...NavDefaultTheme,
            dark: false,
            colors: {
                ...NavDefaultTheme.colors,
                ...colors, // overrides all with your custom theme
            },
        };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <NavigationContainer theme={navTheme}>
                    <StatusBar
                        backgroundColor={colors.primary}
                        style={themeMode === 'dark' ? 'light' : 'dark'}
                    />
                    <DrawerNavigator />
                </NavigationContainer>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
});
