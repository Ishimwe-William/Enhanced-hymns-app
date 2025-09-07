import React from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import StanzaView from './StanzaView';
import RefrainView from './RefrainView';
import {useTheme} from "../../../context/ThemeContext";
import {usePreferences} from "../../../context/PreferencesContext";
import {FONT_SIZES} from "../../../utils/fontSize";

const HymnContent = ({hymn}) => {
    const {colors} = useTheme().theme;
    const {preferences} = usePreferences();

    const getFontSizes = () => {
        return FONT_SIZES[preferences.fontSize] || FONT_SIZES.medium;
    };

    if (!hymn) return null;

    // Function to render content in the correct order
    const renderHymnContent = () => {
        const content = [];

        // Sort stanzas by stanzaNumber to ensure correct order
        const sortedStanzas = hymn.stanzas ?
            Object.values(hymn.stanzas).sort((a, b) => a.stanzaNumber - b.stanzaNumber) : [];

        // Sort refrains by refrainNumber if multiple exist
        const sortedRefrains = hymn.refrains ?
            Object.values(hymn.refrains).sort((a, b) => a.refrainNumber - b.refrainNumber) : [];

        sortedStanzas.forEach((stanza, index) => {
            // Add the stanza
            content.push(
                <View key={`stanza-${stanza.stanzaNumber}`} style={styles.stanzaContainer}>
                    {stanza.stanzaNumber !== 0 && <StanzaView stanza={stanza} fontSizes={fontSizes}/>}

                </View>
            );

            // Add refrain after each stanza
            if (sortedRefrains.length > 0) {
                // Find refrain with matching refrainNumber to stanzaNumber
                let refrainToUse = sortedRefrains.find(refrain => refrain.refrainNumber === stanza.stanzaNumber);

                // If no matching refrain found, use the first refrain as fallback
                if (!refrainToUse) {
                    refrainToUse = sortedRefrains[0];
                }

                content.push(
                    <View key={`refrain-${stanza.stanzaNumber}`} style={styles.refrainContainer}>
                        <RefrainView refrain={refrainToUse} fontSizes={fontSizes}/>
                    </View>
                );
            }
        });

        return content;
    };

    const fontSizes = getFontSizes();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.card,
        },
        scrollContent: {
            flexGrow: 1,
        },
        content: {
            flex: 1,
            padding: 20,
            paddingBottom: 40,
        },
        titleContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 8,
        },
        title: {
            fontSize: fontSizes.title,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
            color: colors.textSecondary,
        },
        hymnNumber: {
            fontSize: fontSizes.number,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        originContainer: {
            width: "80%",
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        origin: {
            fontSize: fontSizes.number,
            fontStyle: 'italic',
            color: '#888',
        },
        stanzaContainer: {
            marginBottom: 20,
        },
        refrainContainer: {
            marginBottom: 20,
        },
    });


    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>
                {/* Hymn Title */}
                {hymn.title && (
                    <>
                        <View style={styles.titleContainer}>
                            {hymn.number && (
                                <Text style={styles.hymnNumber}>Key: {hymn.doh}</Text>
                            )}
                            {hymn.origin && (
                                <View style={styles.originContainer}>
                                    <Text ellipsizeMode={'tail'} numberOfLines={1}
                                          style={styles.origin}>{hymn.origin}</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* Render hymn content */}
                {renderHymnContent()}
            </View>
        </ScrollView>
    );
};

export default HymnContent;
