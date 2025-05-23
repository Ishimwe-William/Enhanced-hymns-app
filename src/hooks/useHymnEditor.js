import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useHymnEditor = (hymnId, loadHymnDetails, updateHymn) => {
    const [hymn, setHymn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editedHymn, setEditedHymn] = useState({
        title: '',
        number: '',
        doh: '',
        origin: '',
        stanzas: {},
        refrains: {}
    });

    useEffect(() => {
        const loadHymn = async () => {
            try {
                setLoading(true);
                const hymnData = await loadHymnDetails(hymnId);
                setHymn(hymnData);
                setEditedHymn({
                    title: hymnData.title || '',
                    number: hymnData.number || '',
                    doh: hymnData.doh || '',
                    origin: hymnData.origin || '',
                    stanzas: hymnData.stanzas || {},
                    refrains: hymnData.refrains || {}
                });
            } catch (error) {
                console.error('Error loading hymn:', error);
                Alert.alert('Error', 'Failed to load hymn for editing');
            } finally {
                setLoading(false);
            }
        };

        loadHymn();
    }, [hymnId]);

    const hasChanges = () => {
        if (!hymn) return false;
        return (
            editedHymn.title !== (hymn.title || '') ||
            editedHymn.number !== (hymn.number || '') ||
            editedHymn.doh !== (hymn.doh || '') ||
            editedHymn.origin !== (hymn.origin || '') ||
            JSON.stringify(editedHymn.stanzas) !== JSON.stringify(hymn.stanzas || {}) ||
            JSON.stringify(editedHymn.refrains) !== JSON.stringify(hymn.refrains || {})
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateHymn(hymnId, editedHymn);
            return true;
        } catch (error) {
            console.error('Error saving hymn:', error);
            Alert.alert('Error', 'Failed to save hymn changes');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const updateStanzaText = (stanzaNumber, newText) => {
        setEditedHymn(prev => ({
            ...prev,
            stanzas: {
                ...prev.stanzas,
                [stanzaNumber]: {
                    ...prev.stanzas[stanzaNumber],
                    stanzaNumber: stanzaNumber,
                    text: newText
                }
            }
        }));
    };

    const updateRefrainText = (refrainNumber, newText) => {
        setEditedHymn(prev => ({
            ...prev,
            refrains: {
                ...prev.refrains,
                [refrainNumber]: {
                    ...prev.refrains[refrainNumber],
                    refrainNumber: refrainNumber,
                    text: newText
                }
            }
        }));
    };

    const addStanza = () => {
        const stanzaNumbers = Object.keys(editedHymn.stanzas).map(Number);
        const nextStanzaNumber = stanzaNumbers.length > 0 ? Math.max(...stanzaNumbers) + 1 : 1;

        setEditedHymn(prev => ({
            ...prev,
            stanzas: {
                ...prev.stanzas,
                [nextStanzaNumber]: {
                    stanzaNumber: nextStanzaNumber,
                    text: ''
                }
            }
        }));
    };

    const addRefrain = () => {
        const refrainNumbers = Object.keys(editedHymn.refrains).map(Number);
        const nextRefrainNumber = refrainNumbers.length > 0 ? Math.max(...refrainNumbers) + 1 : 1;

        setEditedHymn(prev => ({
            ...prev,
            refrains: {
                ...prev.refrains,
                [nextRefrainNumber]: {
                    refrainNumber: nextRefrainNumber,
                    text: ''
                }
            }
        }));
    };

    const removeStanza = (stanzaNumber) => {
        Alert.alert(
            'Remove Stanza',
            'Are you sure you want to remove this stanza?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const newStanzas = { ...editedHymn.stanzas };
                        delete newStanzas[stanzaNumber];
                        setEditedHymn(prev => ({ ...prev, stanzas: newStanzas }));
                    }
                }
            ]
        );
    };

    const removeRefrain = (refrainNumber) => {
        Alert.alert(
            'Remove Refrain',
            'Are you sure you want to remove this refrain?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const newRefrains = { ...editedHymn.refrains };
                        delete newRefrains[refrainNumber];
                        setEditedHymn(prev => ({ ...prev, refrains: newRefrains }));
                    }
                }
            ]
        );
    };

    return {
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
    };
};
