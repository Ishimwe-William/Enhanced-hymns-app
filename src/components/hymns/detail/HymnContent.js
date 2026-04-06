import React from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import StanzaView from './StanzaView';
import RefrainView from './RefrainView';
import {useTheme} from "../../../context/ThemeContext";
import {usePreferences} from "../../../context/PreferencesContext";
import {FONT_SIZES} from "../../../utils/fontSize";

const HymnContent = ({hymn, showTitle = false}) => {
    const {colors} = useTheme().theme;
    const {preferences} = usePreferences();
    const fontSizes = FONT_SIZES[preferences.fontSize] || FONT_SIZES.medium;

    if (!hymn) return null;

    const renderHymnContent = () => {
        const content = [];
        const sortedStanzas = hymn.stanzas ?
            Object.values(hymn.stanzas).sort((a, b) => a.stanzaNumber - b.stanzaNumber) : [];
        const sortedRefrains = hymn.refrains ?
            Object.values(hymn.refrains).sort((a, b) => a.refrainNumber - b.refrainNumber) : [];

        sortedStanzas.forEach((stanza) => {
            if (stanza.stanzaNumber !== 0) {
                content.push(
                    <View key={`stanza-${stanza.stanzaNumber}`} style={styles.stanzaContainer}>
                        <StanzaView stanza={stanza} fontSizes={fontSizes} />
                    </View>
                );
            }
            if (sortedRefrains.length > 0) {
                const refrainToUse = sortedRefrains.find(r => r.refrainNumber === stanza.stanzaNumber) || sortedRefrains[0];
                content.push(
                    <View key={`refrain-${stanza.stanzaNumber}`} style={styles.refrainContainer}>
                        <RefrainView refrain={refrainToUse} fontSizes={fontSizes} />
                    </View>
                );
            }
        });
        return content;
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scrollContent: { flexGrow: 1 },
        content: { flex: 1, padding: 20, paddingBottom: 100 },
        hymnHeader: {
            marginBottom: 24,
            paddingBottom: 16,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        hymnTitle: {
            fontSize: fontSizes.title + 2,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 4,
        },
        hymnNumber: {
            fontSize: fontSizes.number,
            color: colors.textSecondary,
            textAlign: 'center',
            fontWeight: '500',
            marginBottom: 6,
        },
        origin: {
            fontSize: fontSizes.number - 1,
            fontStyle: 'italic',
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 4,
        },
        metaRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        keyBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
        },
        keyLabel: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.textSecondary,
            letterSpacing: 0.5,
            marginRight: 4,
        },
        keyValue: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.header,
        },
        originText: {
            fontSize: 11,
            fontStyle: 'italic',
            color: colors.textSecondary,
            letterSpacing: 0.3,
            maxWidth: '55%',
            textAlign: 'right',
        },
        stanzaContainer: { marginBottom: 8 },
        refrainContainer: { marginBottom: 8 },
    });

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                {showTitle && hymn.title && (
                    <View style={styles.hymnHeader}>
                        <Text style={styles.hymnNumber}>#{hymn.number}</Text>
                        <Text style={styles.hymnTitle}>{hymn.title}</Text>
                        {hymn.origin && <Text style={styles.origin}>{hymn.origin}</Text>}
                    </View>
                )}

                <View style={styles.metaRow}>
                    {hymn.doh && (
                        <View style={styles.keyBadge}>
                            <Text style={styles.keyLabel}>KEY</Text>
                            <Text style={styles.keyValue}>{hymn.doh}</Text>
                        </View>
                    )}
                    {!showTitle && hymn.origin && (
                        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.originText}>
                            {hymn.origin}
                        </Text>
                    )}
                </View>

                {renderHymnContent()}
            </View>
        </ScrollView>
    );
};

export default HymnContent;