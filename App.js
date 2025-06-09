import React, {useCallback, useEffect, useState} from "react";
import {View} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {useFonts} from "expo-font";

import {init} from "./src/services/localHymnService";

import {FontProvider} from "./src/context/FontContext";
import {ThemeProvider} from './src/context/ThemeContext';
import {UserProvider, useUser} from "./src/context/UserContext";
import {PreferencesProvider} from "./src/context/PreferencesContext";
import {HymnProvider} from './src/context/HymnContext';
import ThemedApp from './src/ThemedApp';

SplashScreen.preventAutoHideAsync().catch((err) => console.error("Error preventing splash screen auto-hide:", err));

function AppContent({onAppReady}) {
    const {loading: userLoading, authInitialized} = useUser();
    const [dbInitialized, setDbInitialized] = useState(false);

    useEffect(() => {
        const prepareDb = async () => {
            try {
                await init();
                setDbInitialized(true);
            } catch (e) {
                console.warn("DB init error:", e);
                setDbInitialized(true); // continue even if it fails
            }
        };
        prepareDb();
    }, []);

    useEffect(() => {
        if (dbInitialized && authInitialized) {
            onAppReady();
        }
    }, [dbInitialized, authInitialized]);

    return (
        <View style={{flex: 1}}>
            <ThemeProvider>
                <PreferencesProvider>
                    <HymnProvider>
                        <ThemedApp/>
                    </HymnProvider>
                </PreferencesProvider>
            </ThemeProvider>
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
