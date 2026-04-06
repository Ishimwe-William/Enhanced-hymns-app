import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/ui/Header';
import { fetchHymnDetails, updateHymnData } from '../../services/hymnService';
import LoadingScreen from '../../components/LoadingScreen';

const EditHymnScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { colors } = theme;

    const hymnId = route.params?.hymnId;
    const [hymn, setHymn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States mapped to your new DB structure
    const [title, setTitle] = useState('');
    const [number, setNumber] = useState('');
    const [doh, setDoh] = useState('');
    const [origin, setOrigin] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [youtube, setYoutube] = useState('');
    const [stanzasRaw, setStanzasRaw] = useState('[]');
    const [refrainsRaw, setRefrainsRaw] = useState('[]');

    useEffect(() => {
        if (hymnId) {
            loadHymn();
        } else {
            setLoading(false);
        }
    }, [hymnId]);

    const loadHymn = async () => {
        try {
            const data = await fetchHymnDetails(hymnId);
            setHymn(data);

            setTitle(data.title || '');
            setNumber(data.number ? String(data.number) : '');
            setDoh(data.doh || '');
            setOrigin(data.origin || '');
            setAudioUrl(data.audioUrl || '');
            setYoutube(data.youtube || '');

            setStanzasRaw(JSON.stringify(data.stanzas || [], null, 2));
            setRefrainsRaw(JSON.stringify(data.refrains || [], null, 2));
        } catch (error) {
            Alert.alert("Error", "Could not load hymn data.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            let parsedStanzas = [];
            let parsedRefrains = [];

            try {
                parsedStanzas = JSON.parse(stanzasRaw);
                parsedRefrains = refrainsRaw ? JSON.parse(refrainsRaw) : [];
            } catch (e) {
                Alert.alert("JSON Format Error", "Please ensure the stanzas and refrains remain formatted as valid JSON Arrays.");
                setSaving(false);
                return;
            }

            const updatedData = {
                ...hymn,
                title,
                number: parseInt(number, 10) || 0,
                doh,
                origin,
                audioUrl,
                youtube,
                stanzas: parsedStanzas,
                refrains: parsedRefrains
            };

            await updateHymnData(hymnId, updatedData);

            Alert.alert("Success", "Hymn updated! Pull down on the Hymns List to refresh the database.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to update hymn.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingScreen message="Loading Hymn Data..." />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title={`Edit Hymn: ${number}`} onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>

                <Text style={[styles.label, { color: colors.text }]}>Hymn Number</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={number} onChangeText={setNumber} keyboardType="numeric" />

                <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Title</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={title} onChangeText={setTitle} />

                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Doh (Key)</Text>
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={doh} onChangeText={setDoh} />
                    </View>
                    <View style={styles.halfWidth}>
                        <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Origin</Text>
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={origin} onChangeText={setOrigin} />
                    </View>
                </View>

                <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Audio URL</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={audioUrl} onChangeText={setAudioUrl} />

                <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>YouTube Video ID</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={youtube} onChangeText={setYoutube} />

                <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Stanzas (JSON Array)</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
                    value={stanzasRaw}
                    onChangeText={setStanzasRaw}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Refrains (JSON Array)</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { height: 150, color: colors.text, borderColor: colors.border }]}
                    value={refrainsRaw}
                    onChangeText={setRefrainsRaw}
                    multiline
                    textAlignVertical="top"
                />

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#4CAF50' }]} onPress={handleSave} disabled={saving}>
                    <Text style={styles.saveButtonText}>{saving ? "Saving to Firebase..." : "Save Changes"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfWidth: { width: '48%' },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
    textArea: { height: 350, fontFamily: 'monospace', fontSize: 13 },
    saveButton: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 40 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default EditHymnScreen;