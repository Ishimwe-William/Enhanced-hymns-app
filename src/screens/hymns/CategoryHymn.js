import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/ui/Header';
import HymnListView from '../../components/hymns/list/HymnListView';
import { useHymns } from '../../context/HymnContext';

const CategoryHymns = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { category } = route.params;
    const { hymns } = useHymns();

    // Mock category filtering - replace with actual category logic
    const categoryHymns = hymns.slice(0, category.count || 10);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleHymnSelect = (hymnId) => {
        navigation.navigate('HymnDetail', { hymnId });
    };

    return (
        <View style={styles.container}>
            <Header title={category.name} showBack onBack={handleBack} />
            <HymnListView hymns={categoryHymns} onHymnSelect={handleHymnSelect} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default CategoryHymns;
