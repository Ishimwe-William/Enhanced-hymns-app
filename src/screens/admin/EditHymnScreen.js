import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/ui/Header';
import { fetchHymnDetails, updateHymnData } from '../../services/hymnService';
import LoadingScreen from '../../components/LoadingScreen';

// FIXED: Added 'style' prop so styles.half (flex: 1) actually works
const Field = ({ label, colors, children, multiline, style }) => (
    <View style={[styles.fieldGroup, style]}>
        <Text numberOfLines={multiline} style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {children}
    </View>
);

const EditHymnScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { colors } = theme;
    const hymnId = route.params?.hymnId;

    const [hymn, setHymn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [number, setNumber] = useState('');
    const [doh, setDoh] = useState('');
    const [origin, setOrigin] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [youtube, setYoutube] = useState('');
    const [stanzasRaw, setStanzasRaw] = useState('[]');
    const [refrainsRaw, setRefrainsRaw] = useState('[]');

    const inputStyle = [styles.input, { color: colors.text, backgroundColor: colors.primary, borderColor: colors.border }];

    useEffect(() => { if (hymnId) loadHymn(); else setLoading(false); }, [hymnId]);

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
        } catch {
            Alert.alert("Error", "Could not load hymn data.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            let parsedStanzas, parsedRefrains;
            try {
                parsedStanzas = JSON.parse(stanzasRaw);
                parsedRefrains = refrainsRaw ? JSON.parse(refrainsRaw) : [];
            } catch {
                Alert.alert("JSON Format Error", "Please ensure stanzas and refrains are valid JSON arrays.");
                setSaving(false);
                return;
            }
            await updateHymnData(hymnId, {
                ...hymn, title, number: parseInt(number, 10) || 0,
                doh, origin, audioUrl, youtube,
                stanzas: parsedStanzas, refrains: parsedRefrains,
            });
            Alert.alert("Success", "Hymn updated! Pull down on the Hymns List to refresh.");
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
            <Header title={`#${number} · Edit`} showBack onBack={() => navigation.goBack()} showMore={false} />
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BASIC INFO</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Field label="Hymn Number" colors={colors}>
                        <TextInput style={inputStyle} value={number} onChangeText={setNumber} keyboardType="numeric" />
                    </Field>
                    <Field label="Title" colors={colors}>
                        <TextInput style={inputStyle} value={title} onChangeText={setTitle} />
                    </Field>
                    <View style={styles.row}>
                        <Field label="Key (Doh)" colors={colors}>
                            <TextInput style={inputStyle} value={doh} onChangeText={setDoh} />
                        </Field>
                        {/* FIXED: Removed the max-width hack so styles.half can split it 50/50 */}
                        <Field label="Origin" colors={colors} style={styles.half}>
                            <TextInput style={inputStyle} value={origin} onChangeText={setOrigin} />
                        </Field>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MEDIA</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Field label="Audio URL" colors={colors}>
                        <TextInput style={inputStyle} value={audioUrl} onChangeText={setAudioUrl} autoCapitalize="none" />
                    </Field>
                    <Field label="YouTube Video ID" colors={colors}>
                        <TextInput style={inputStyle} value={youtube} onChangeText={setYoutube} autoCapitalize="none" />
                    </Field>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LYRICS (JSON)</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Field label="Stanzas" colors={colors}>
                        <TextInput
                            style={[inputStyle, styles.textArea]}
                            value={stanzasRaw}
                            onChangeText={setStanzasRaw}
                            multiline textAlignVertical="top"
                        />
                    </Field>
                    <Field label="Refrains" colors={colors}>
                        <TextInput
                            style={[inputStyle, styles.textArea, { height: 150 }]}
                            value={refrainsRaw}
                            onChangeText={setRefrainsRaw}
                            multiline textAlignVertical="top"
                        />
                    </Field>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 40 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4, marginTop: 16 },
    card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
    fieldGroup: { gap: 6 },
    label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
    input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
    textArea: { height: 300, fontFamily: 'monospace', fontSize: 12 },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    saveButton: {
        backgroundColor: '#3CB371',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

export default EditHymnScreen;