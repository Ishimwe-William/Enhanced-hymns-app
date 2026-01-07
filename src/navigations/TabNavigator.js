import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import HymnsStackNavigator from './stacks/HymnsStackNavigator';
//import CategoriesScreen from '../screens/hymns/CategoriesScreen';
import SearchScreen from '../screens/hymns/SearchScreen';
import RecentScreen from '../screens/hymns/RecentScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                let iconName = 'home';
                switch (route.name) {
                    case 'HymnsStack':
                        iconName = 'musical-notes';
                        break;
                    case 'Categories':
                        iconName = 'albums';
                        break;
                    case 'Search':
                        iconName = 'search';
                        break;
                    case 'Recent':
                        iconName = 'time';
                        break;
                }

                return {
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? iconName : `${iconName}-outline`}
                            size={size}
                            color={color}
                        />
                    ),
                    tabBarActiveTintColor: colors.header,
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarStyle: {
                        backgroundColor: colors.card,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingTop: 5,
                        height: 60,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                        marginBottom: 5,
                    },
                };
            }}
        >
            <Tab.Screen
                name="HymnsStack"
                component={HymnsStackNavigator}
                options={({route}) => {
                    const routeName = getFocusedRouteNameFromRoute(route) ?? 'HymnsList';
                    return {
                        tabBarStyle: routeName !== 'HymnsList' && {display: 'none'},
                        tabBarLabel: 'Hymns'
                    };
                }}
            />
            {/*<Tab.Screen*/}
            {/*    name="Categories"*/}
            {/*    component={CategoriesScreen}*/}
            {/*    options={{ tabBarLabel: 'Categories' }}*/}
            {/*/>*/}
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{ tabBarLabel: 'Search' }}
            />
            <Tab.Screen
                name="Recent"
                component={RecentScreen}
                options={{ tabBarLabel: 'Recent' }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
