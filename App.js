import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { init as initDatabase } from './src/services/localHymnService';

import { FontProvider } from './src/context/FontContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { UserProvider, useUser } from './src/context/UserContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import { HymnProvider } from './src/context/HymnContext';
import { NetworkProvider } from './src/context/NetworkContext';
import ThemedApp from './src/ThemedApp';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {setupTrackPlayer} from "./src/services/TrackPlayerService";

SplashScreen.preventAutoHideAsync().catch((err) =>
    console.error("Error preventing splash screen auto-hide:", err)
);

function AppContent({ onAppReady }) {
    const { initializing: authInitializing } = useUser();
    const { isThemeLoaded } = useTheme();
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbInitError, setDbInitError] = useState(null);

    useEffect(() => {
        const prepareDb = async () => {
            try {
                await initDatabase();
                setDbInitialized(true);
            } catch (e) {
                console.error("DB init error:", e);
                setDbInitError(e);
            }
        };
        prepareDb();
    }, []);

    useEffect(() => {
        const initializeTrackPlayer = async () => {
            try {
                await setupTrackPlayer();
            } catch (error) {
                console.error('Failed to initialize TrackPlayer:', error);
            }
        };

        initializeTrackPlayer();
    }, []);

    useEffect(() => {
        if (dbInitError) {
            Alert.alert(
                'Database Error',
                'Failed to initialize database. Please restart the app.',
                [{ text: 'OK', onPress: () => setDbInitError(null) }]
            );
            return;
        }

        if (dbInitialized && !authInitializing && isThemeLoaded) {
            onAppReady();
        }
    }, [dbInitialized, authInitializing, isThemeLoaded, dbInitError, onAppReady]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NetworkProvider>
                <PreferencesProvider>
                    <HymnProvider dbInitialized={dbInitialized}>
                        <ThemedApp />
                    </HymnProvider>
                </PreferencesProvider>
            </NetworkProvider>
        </GestureHandlerRootView>
    );
}

export default function App() {
    const [fontsLoaded, fontsError] = useFonts({
        'Matura MT Script Capitals': require('./assets/fonts/MATURASC.ttf'),
    });

    const [appReady, setAppReady] = useState(false);

    const onAppReady = useCallback(() => {
        setAppReady(true);
    }, []);

    useEffect(() => {
        const hideSplashScreen = async () => {
            if (fontsLoaded && appReady) {
                try {
                    await SplashScreen.hideAsync();
                } catch (error) {
                    console.error("Error hiding splash screen:", error);
                }
            }
        };
        hideSplashScreen();
    }, [fontsLoaded, appReady]);

    useEffect(() => {
        if (fontsError) {
            console.error("Font loading error:", fontsError);
            Alert.alert(
                'Font Loading Error',
                'Some fonts failed to load. The app will continue with default fonts.',
                [{ text: 'OK' }]
            );
        }
    }, [fontsError]);

    if (!fontsLoaded && !fontsError) {
        return null;
    }

    return (
        <UserProvider>
            <FontProvider>
                <ThemeProvider>
                    <AppContent onAppReady={onAppReady} />
                </ThemeProvider>
            </FontProvider>
        </UserProvider>
    );
}
