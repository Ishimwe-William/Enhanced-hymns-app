import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../components/ui/Header';
import LoadingScreen from '../components/LoadingScreen';
import HymnBasicInfo from '../components/hymns/edit/HymnBasicInfo';
import HymnStanzasSection from '../components/hymns/edit/HymnStanzasSection';
import HymnRefrainsSection from '../components/hymns/edit/HymnRefrainsSection';
import { useHymns } from '../context/HymnContext';
import { useHymnEditor } from '../hooks/useHymnEditor';

const HymnEdit = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { hymnId } = route.params;
    const { loadHymnDetails, updateHymn } = useHymns();

    const {
        hymn,
        loading,
        saving,
        editedHymn,
        setEditedHymn,
        hasChanges,
        handleSave,
        updateStanzaText,
        updateRefrainText,
        addStanza,
        addRefrain,
        removeStanza,
        removeRefrain
    } = useHymnEditor(hymnId, loadHymnDetails, updateHymn);

    const handleBack = () => {
        if (hasChanges()) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to go back?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    const handleSaveAndNavigate = async () => {
        const success = await handleSave();
        if (success) {
            Alert.alert('Success', 'Hymn updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading hymn for editing..." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Header
                title="Edit Hymn"
                showBack
                onBack={handleBack}
                onMore={handleSaveAndNavigate}
                moreIcon={'save-outline'}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <HymnBasicInfo
                    editedHymn={editedHymn}
                    setEditedHymn={setEditedHymn}
                />

                <HymnStanzasSection
                    stanzas={editedHymn.stanzas}
                    onAddStanza={addStanza}
                    onUpdateStanza={updateStanzaText}
                    onRemoveStanza={removeStanza}
                />

                <HymnRefrainsSection
                    refrains={editedHymn.refrains}
                    onAddRefrain={addRefrain}
                    onUpdateRefrain={updateRefrainText}
                    onRemoveRefrain={removeRefrain}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
});

export default HymnEdit;
