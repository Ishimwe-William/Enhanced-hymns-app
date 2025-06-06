import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import TabNavigator from './TabNavigator';
import FavoritesScreen from '../screens/hymns/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    const { theme } = useTheme();
    const { colors } = theme;

    const screenOptions = {
        headerShown: false,
        drawerStyle: {
            backgroundColor: colors.card,
            width: 280,
        },
        drawerActiveTintColor: colors.header,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '500',
        },
    };

    const createDrawerIcon = (iconName) => ({ color, size }) => (
        <Ionicons name={iconName} size={size} color={color} />
    );

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={screenOptions}
        >
            <Drawer.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{
                    drawerLabel: 'Home',
                    drawerIcon: createDrawerIcon('home-outline'),
                }}
            />
            <Drawer.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    drawerLabel: 'Favorites',
                    drawerIcon: createDrawerIcon('heart-outline'),
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    drawerLabel: 'Settings',
                    drawerIcon: createDrawerIcon('settings-outline'),
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    drawerLabel: 'Profile',
                    drawerIcon: createDrawerIcon('person-outline'),
                }}
            />
            <Drawer.Screen
                name="About"
                component={AboutScreen}
                options={{
                    drawerLabel: 'About',
                    drawerIcon: createDrawerIcon('information-circle-outline'),
                }}
            />
        </Drawer.Navigator>
    );
}
