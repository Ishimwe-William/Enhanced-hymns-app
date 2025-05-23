import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Header from '../components/ui/Header';
import SearchBar from '../components/ui/SearchBar';
import HymnListView from '../components/hymns/list/HymnListView';
import LoadingScreen from '../components/LoadingScreen';
import { useHymns } from '../context/HymnContext';

const HymnsList = () => {
    const navigation = useNavigation();
    const { hymns, loading, loadHymns } = useHymns();
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredHymns = hymns.filter(hymn =>
        hymn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hymn.number.toString().includes(searchQuery)
    );

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleHymnSelect = (hymnId) => {
        navigation.navigate('HymnDetail', { hymnId });
    };

    if (loading) {
        return <LoadingScreen message="Loading hymns..." />;
    }

    return (
        <View style={styles.container}>
            <Header
                title="Hymns"
                showMenu
                showRefresh
                onMenu={handleMenuPress}
                onRefresh={loadHymns}
            />
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search hymns..."
            />
            <HymnListView hymns={filteredHymns} onHymnSelect={handleHymnSelect} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default HymnsList;
