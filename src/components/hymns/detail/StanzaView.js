import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from "../../../context/ThemeContext";
import {renderTextWithUnderlines} from "../../../utils/hymns/textParser";

const StanzaView = ({stanza, fontSizes}) => {
    const {colors} = useTheme().theme;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 20,
            alignItems: 'center',
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            gap: 8,
        },
        line: {
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
        },
        title: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.textSecondary,
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        text: {
            textAlign: 'center',
            fontSize: fontSizes.text,
            lineHeight: fontSizes.lineHeight,
            color: colors.text,
        },
    }), [colors, fontSizes]);

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <View style={styles.line} />
                <Text style={styles.title}>Stanza {stanza.stanzaNumber}</Text>
                <View style={styles.line} />
            </View>
            {renderTextWithUnderlines(stanza.text, stanza.underline, styles.text, colors.text)}
        </View>
    );
};

export default React.memo(StanzaView);