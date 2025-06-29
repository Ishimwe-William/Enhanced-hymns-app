import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import Header from '../../components/ui/Header';
import SearchBar from '../../components/ui/SearchBar';
import HymnListView from '../../components/hymns/list/HymnListView';
import EmptyState from '../../components/EmptyState';
import {useHymns} from '../../context/HymnContext';
import {useFilteredHymns} from "../../hooks/useFilteredHymns";

const SearchScreen = () => {
    const navigation = useNavigation();
    const {hymns} = useHymns();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHymns = useFilteredHymns(hymns, searchQuery);

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleHymnSelect = (hymnId) => {
        navigation.navigate('HymnsStack', {
            screen: 'HymnDetail',
            params: {hymnId}
        });
    };

    return (
        <View style={styles.container}>
            <Header title="Search" showMenu onMenu={handleMenuPress} showMore={false}/>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search hymns, titles, authors..."
                autoFocus
            />
            {searchQuery.trim() === '' ? (
                <EmptyState
                    icon="search"
                    title="Search Hymns"
                    message="Enter a hymn title, number, or author name to search"
                />
            ) : filteredHymns.length === 0 ? (
                <EmptyState
                    icon="search"
                    title="No Results"
                    message={`No hymns found for "${searchQuery}"`}
                />
            ) : (
                <HymnListView hymns={filteredHymns} onHymnSelect={handleHymnSelect}/>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default SearchScreen;
