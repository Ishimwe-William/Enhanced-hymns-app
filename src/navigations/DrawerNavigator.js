import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Ionicons} from '@expo/vector-icons';
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/hymns/FavoritesScreen';
import AboutScreen from '../screens/AboutScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#f8f9fa',
                    width: 280,
                },
                drawerActiveTintColor: '#007AFF',
                drawerInactiveTintColor: '#666',
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: '500',
                },
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{
                    drawerLabel: 'Home',
                    drawerIcon: ({color, size}) => (
                        <Ionicons name="home-outline" size={size} color={color}/>
                    ),
                }}
            />
            <Drawer.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    drawerLabel: 'Favorites',
                    drawerIcon: ({color, size}) => (
                        <Ionicons name="heart-outline" size={size} color={color}/>
                    ),
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    drawerLabel: 'Settings',
                    drawerIcon: ({color, size}) => (
                        <Ionicons name="settings-outline" size={size} color={color}/>
                    ),
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    drawerLabel: 'Profile',
                    drawerIcon: ({color, size}) => (
                        <Ionicons name="person-outline" size={size} color={color}/>
                    ),
                }}
            />
            <Drawer.Screen
                name="About"
                component={AboutScreen}
                options={{
                    drawerLabel: 'About',
                    drawerIcon: ({color, size}) => (
                        <Ionicons name="information-circle-outline" size={size} color={color}/>
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
