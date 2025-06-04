import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/Header';

const categories = [
    { id: '1', name: 'Praise & Worship', icon: 'musical-notes', count: 45 },
    { id: '4', name: 'Traditional', icon: 'library', count: 67 },
    { id: '5', name: 'Contemporary', icon: 'headset', count: 34 },
    { id: '6', name: 'Communion', icon: 'wine', count: 12 },
    { id: '7', name: 'Baptism', icon: 'water', count: 8 },
    { id: '8', name: 'Prayer', icon: 'hand-right', count: 29 },
];

const CategoriesScreen = () => {
    const navigation = useNavigation();

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleCategoryPress = (category) => {
        navigation.navigate('HymnsStack', {
            screen: 'CategoryHymns',
            params: { category }
        });
    };

    const renderCategory = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(item)}
        >
            <View style={styles.categoryIcon}>
                <Ionicons name={item.icon} size={24} color="#007AFF" />
            </View>
            <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryCount}>{item.count} hymns</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header title="Categories" showMenu onMenu={handleMenuPress} />
            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    categoryContent: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    categoryCount: {
        fontSize: 14,
        color: '#666',
    },
});

export default CategoriesScreen;
