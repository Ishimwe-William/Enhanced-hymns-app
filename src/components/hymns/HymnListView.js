import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import HymnListItem from './HymnListItem';

const HymnListView = ({ hymns, onHymnSelect }) => {
    const renderItem = ({ item }) => (
        <HymnListItem hymn={item} onPress={() => onHymnSelect(item.id)} />
    );

    return (
        <FlatList
            data={hymns}
            renderItem={renderItem}
            keyExtractor={(item) => item.number}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
});

export default HymnListView;
