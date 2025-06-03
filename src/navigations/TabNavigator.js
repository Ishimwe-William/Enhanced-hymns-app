import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HymnsStackNavigator from './stacks/HymnsStackNavigator';
import CategoriesScreen from '../screens/hymns/CategoriesScreen';
import SearchScreen from '../screens/hymns/SearchScreen';
import RecentScreen from '../screens/hymns/RecentScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HymnsStack') {
                        iconName = focused ? 'musical-notes' : 'musical-notes-outline';
                    } else if (route.name === 'Categories') {
                        iconName = focused ? 'albums' : 'albums-outline';
                    } else if (route.name === 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Recent') {
                        iconName = focused ? 'time' : 'time-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5E7',
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: 5,
                },
            })}
        >
            <Tab.Screen
                name="HymnsStack"
                component={HymnsStackNavigator}
                options={{
                    tabBarLabel: 'Hymns',
                }}
            />
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarLabel: 'Categories',
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Search',
                }}
            />
            <Tab.Screen
                name="Recent"
                component={RecentScreen}
                options={{
                    tabBarLabel: 'Recent',
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
