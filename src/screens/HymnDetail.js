import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../components/ui/Header';
import HymnContent from '../components/hymns/HymnContent';
import HymnControls from '../components/hymns/HymnControls';
import LoadingScreen from '../components/LoadingScreen';
import { useHymns } from '../context/HymnContext';

const HymnDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { hymnId } = route.params;
    const { loadHymnDetails } = useHymns();
    const [hymn, setHymn] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHymn = async () => {
            try {
                setLoading(true);
                const hymnData = await loadHymnDetails(hymnId);
                setHymn(hymnData);
            } catch (error) {
                console.error('Error loading hymn:', error);
            } finally {
                setLoading(false);
            }
        };

        loadHymn();
    }, [hymnId]);

    const handleBack = () => {
        navigation.goBack();
    };

    if (loading) {
        return <LoadingScreen message="Loading hymn..." />;
    }

    return (
        <View style={styles.container}>
            <Header title={` ${hymn.number} - ${hymn?.title}`  || 'Hymn'} showBack onBack={handleBack} />
            <HymnContent hymn={hymn} />
            <HymnControls hymn={hymn} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default HymnDetail;
