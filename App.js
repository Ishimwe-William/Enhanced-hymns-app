import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'expo-status-bar';
import DrawerNavigator from './src/navigations/DrawerNavigator';
import {HymnProvider} from './src/context/HymnContext';
import {SafeAreaView} from "react-native-safe-area-context";
import {UserProvider} from "./src/context/UserContext";
import {PreferencesProvider} from "./src/context/PreferencesContext";

const AppProviders = ({children}) => {
    return (
        <UserProvider>
            <PreferencesProvider>
                <HymnProvider>
                    {children}
                </HymnProvider>
            </PreferencesProvider>
        </UserProvider>
    );
};

export default function App() {
    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar style="dark"/>
            <AppProviders>
                <NavigationContainer>
                    <DrawerNavigator/>
                </NavigationContainer>
            </AppProviders>
        </SafeAreaView>
    );
}


