import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {
    NavigationContainer,
    DefaultTheme as NavDefaultTheme,
    DarkTheme as NavDarkTheme
} from '@react-navigation/native';
import {useTheme} from './context/ThemeContext';
import DrawerNavigator from './navigations/DrawerNavigator';
import {SafeAreaView} from "react-native-safe-area-context";

export default function ThemedApp() {
    const {theme, themeMode} = useTheme();

    const navTheme = themeMode === 'dark'
        ? {
            ...NavDarkTheme,
            dark: true,
            colors: {
                ...NavDarkTheme.colors,
                primary: theme.colors.primary,
                background: theme.colors.background,
                card: theme.colors.card,
                text: theme.colors.text,
                border: theme.colors.border,
                notification: theme.colors.notification,
            },
        }
        : {
            ...NavDefaultTheme,
            dark: false,
            colors: {
                ...NavDefaultTheme.colors,
                primary: theme.colors.primary,
                background: theme.colors.background,
                card: theme.colors.card,
                text: theme.colors.text,
                border: theme.colors.border,
                notification: theme.colors.notification,
            },
        };

    return (
        <SafeAreaView style={{flex: 1}}>
            <NavigationContainer theme={navTheme}>
                <StatusBar backgroundColor={"#00428a"} barStyle="light-content"/>
                <DrawerNavigator/>
            </NavigationContainer>
        </SafeAreaView>
    );
}
