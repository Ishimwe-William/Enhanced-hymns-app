import React, {useCallback, useEffect, useState} from "react";
import {Alert, View} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {useFonts} from "expo-font";

import {init as initDatabase} from "./src/services/localHymnService";

import {FontProvider} from "./src/context/FontContext";
import {ThemeProvider} from './src/context/ThemeContext';
import {UserProvider, useUser} from "./src/context/UserContext";
import {PreferencesProvider} from "./src/context/PreferencesContext";
import {HymnProvider} from './src/context/HymnContext';
import ThemedApp from './src/ThemedApp';
import {NetworkProvider} from "./src/context/NetworkContext";

SplashScreen.preventAutoHideAsync().catch((err) => console.error("Error preventing splash screen auto-hide:", err));

function AppContent({ onAppReady }) {
    const { authInitialized } = useUser();
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbInitError, setDbInitError] = useState(null);

    useEffect(() => {
        const prepareDb = async () => {
            try {
                await initDatabase();
                setDbInitialized(true);
            } catch (e) {
                console.error("DB init error:", e);
                setDbInitError(e); // Do not set dbInitialized to true on error
            }
        };
        prepareDb();
    }, []);

    useEffect(() => {
        if (dbInitialized && authInitialized) {
            onAppReady();
        } else if (dbInitError) {
            Alert.alert('Database Error', 'Failed to initialize database. Please restart the app.');
        }
    }, [dbInitialized, authInitialized, dbInitError]);

    return (
        <View style={{ flex: 1 }}>
            <NetworkProvider>
                <ThemeProvider>
                    <PreferencesProvider>
                        <HymnProvider dbInitialized={dbInitialized}>
                            <ThemedApp />
                        </HymnProvider>
                    </PreferencesProvider>
                </ThemeProvider>
            </NetworkProvider>
        </View>
    );
}

export default function App() {
    const [fontsLoaded] = useFonts({
        'Matura MT Script Capitals': require('./assets/fonts/MATURASC.ttf'),
    });

    const [appReady, setAppReady] = useState(false);

    const onAppReady = useCallback(() => {
        setAppReady(true);
    }, []);

    useEffect(() => {
        const maybeHide = async () => {
            if (fontsLoaded && appReady) {
                await SplashScreen.hideAsync();
            }
        };
        maybeHide();
    }, [fontsLoaded, appReady]);

    if (!fontsLoaded) return null;

    return (
        <UserProvider>
            <FontProvider>
                <AppContent onAppReady={onAppReady}/>
            </FontProvider>
        </UserProvider>
    );
}
