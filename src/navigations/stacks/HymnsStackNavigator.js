import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useTheme} from '../../context/ThemeContext';

import HymnsList from '../../screens/hymns/HymnsList';
import HymnDetail from '../../screens/hymns/HymnDetail';
import HymnEdit from '../../screens/hymns/HymnEdit';
import CategoryHymns from '../../screens/hymns/CategoryHymn';

const Stack = createStackNavigator();

const HymnsStackNavigator = () => {
    const {theme} = useTheme();
    const {colors} = theme;

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: {
                    backgroundColor: colors.card,
                },
            }}
        >
            <Stack.Screen
                name="HymnsList"
                component={HymnsList}
                options={{title: 'Hymns'}}
            />
            <Stack.Screen
                name="HymnDetail"
                component={HymnDetail}
                options={{title: 'Hymn Detail'}}
            />
            <Stack.Screen
                name="HymnEdit"
                component={HymnEdit}
                options={{title: 'Hymn Edit'}}
            />
            <Stack.Screen
                name="CategoryHymns"
                component={CategoryHymns}
                options={{title: 'Category Hymns'}}
            />
        </Stack.Navigator>
    );
};

export default HymnsStackNavigator;
