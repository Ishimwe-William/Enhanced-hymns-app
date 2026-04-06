import React, {useEffect, useState} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Keyboard } from 'react-native';
import HymnsStackNavigator from './stacks/HymnsStackNavigator';
import SearchScreen from '../screens/hymns/SearchScreen';
import RecentScreen from '../screens/hymns/RecentScreen';

const Tab = createBottomTabNavigator();

// Screens within HymnsStack that should always hide the tab bar (regardless of keyboard)
const HIDE_TAB_BAR_ROUTES = ['HymnDetail', 'CategoryHymns', 'EditHymn'];

const TabNavigator = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => { show.remove(); hide.remove(); };
    }, []);

    const visibleTabBarStyle = {
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 5,
        height: 60,
    };

    const hiddenTabBarStyle = { display: 'none' };

    // Hide if keyboard is up OR route demands it
    const getHymnsStackTabStyle = (route) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'HymnsList';
        if (HIDE_TAB_BAR_ROUTES.includes(routeName)) return hiddenTabBarStyle;
        if (keyboardVisible) return hiddenTabBarStyle;
        return visibleTabBarStyle;
    };

    const tabBarStyle = keyboardVisible ? hiddenTabBarStyle : visibleTabBarStyle;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                let iconName = 'home';
                switch (route.name) {
                    case 'HymnsStack': iconName = 'musical-notes'; break;
                    case 'Search':     iconName = 'search';        break;
                    case 'Recent':     iconName = 'time';          break;
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
                    tabBarStyle,
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
                options={({ route }) => ({
                    tabBarStyle: getHymnsStackTabStyle(route),
                    tabBarLabel: 'Hymns',
                })}
            />
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