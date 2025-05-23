import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Header from '../components/ui/Header';
import HymnListView from '../components/hymns/list/HymnListView';
import EmptyState from '../components/EmptyState';
import { useHymns } from '../context/HymnContext';

const FavoritesScreen = () => {
    const navigation = useNavigation();
    const { favorites } = useHymns();

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleHymnSelect = (hymnId) => {
        navigation.navigate('MainTabs', {
            screen: 'HymnsStack',
            params: {
                screen: 'HymnDetail',
                params: { hymnId }
            }
        });
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Header
                title="Favorites"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
            />
            {favorites.length === 0 ? (
                <EmptyState
                    icon="heart-outline"
                    title="No Favorites Yet"
                    message="Tap the heart icon on any hymn to add it to your favorites"
                />
            ) : (
                <HymnListView hymns={favorites} onHymnSelect={handleHymnSelect} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default FavoritesScreen;
