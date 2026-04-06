import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useTheme} from '../../context/ThemeContext';

import HymnsList from '../../screens/hymns/HymnsList';
import HymnDetail from '../../screens/hymns/HymnDetail';
import CategoryHymns from '../../screens/hymns/CategoryHymn';
// NEW: Import your future edit screen
import EditHymnScreen from '../../screens/admin/EditHymnScreen';

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
                name="CategoryHymns"
                component={CategoryHymns}
                options={{title: 'Category Hymns'}}
            />
            {/* NEW: Added the Edit Screen to the stack */}
            <Stack.Screen
                name="EditHymn"
                component={EditHymnScreen}
                options={{title: 'Edit Hymn'}}
            />
        </Stack.Navigator>
    );
};

export default HymnsStackNavigator;