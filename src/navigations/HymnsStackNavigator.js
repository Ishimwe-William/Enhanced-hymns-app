import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HymnsList from '../screens/HymnsList';
import HymnDetail from '../screens/HymnDetail';
import CategoryHymns from "../screens/CategoryHymn";

const Stack = createStackNavigator();

const HymnsStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#f5f5f5' },
            }}
        >
            <Stack.Screen
                name="HymnsList"
                component={HymnsList}
                options={{ title: 'Hymns' }}
            />
            <Stack.Screen
                name="HymnDetail"
                component={HymnDetail}
                options={{ title: 'Hymn Detail' }}
            />
            <Stack.Screen
                name="CategoryHymns"
                component={CategoryHymns}
                options={{ title: 'Category Hymns' }}
            />
        </Stack.Navigator>
    );
};

export default HymnsStackNavigator;
