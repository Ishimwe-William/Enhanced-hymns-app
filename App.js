import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'expo-status-bar';
import DrawerNavigator from './src/navigations/DrawerNavigator';
import {HymnProvider} from './src/context/HymnContext';
import {SafeAreaView} from "react-native-safe-area-context";

export default function App() {
    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar style="light"/>
            <HymnProvider>
                <NavigationContainer>
                    <DrawerNavigator/>
                </NavigationContainer>
            </HymnProvider>
        </SafeAreaView>

    );
}
