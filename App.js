import React, {useCallback, useEffect, useState} from "react";
import {View} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {init} from "./src/services/localHymnService";

import {ThemeProvider} from './src/context/ThemeContext';
import {UserProvider} from "./src/context/UserContext";
import {PreferencesProvider} from "./src/context/PreferencesContext";
import {HymnProvider} from './src/context/HymnContext';

import ThemedApp from './src/ThemedApp';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await init();
            } catch (error) {
                console.warn("Database init failed:", error);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <View style={{flex: 1}} onLayout={onLayoutRootView}>
            <UserProvider>
                <ThemeProvider>
                    <PreferencesProvider>
                        <HymnProvider>
                            <ThemedApp/>
                        </HymnProvider>
                    </PreferencesProvider>
                </ThemeProvider>
            </UserProvider>
        </View>
    );
}
