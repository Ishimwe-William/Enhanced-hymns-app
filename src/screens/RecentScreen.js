import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Header from '../components/ui/Header';
import HymnListView from '../components/hymns/HymnListView';
import EmptyState from '../components/EmptyState';
import { useHymns } from '../context/HymnContext';

const RecentScreen = () => {
    const navigation = useNavigation();
    const { recentHymns } = useHymns();

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleHymnSelect = (hymnId) => {
        navigation.navigate('HymnsStack', {
            screen: 'HymnDetail',
            params: { hymnId }
        });
    };

    return (
        <View style={styles.container}>
            <Header title="Recent" showMenu onMenu={handleMenuPress} />
            {recentHymns.length === 0 ? (
                <EmptyState
                    icon="time-outline"
                    title="No Recent Hymns"
                    message="Hymns you view will appear here for quick access"
                />
            ) : (
                <HymnListView hymns={recentHymns} onHymnSelect={handleHymnSelect} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default RecentScreen;
