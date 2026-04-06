import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from "../../../context/ThemeContext";
import {renderTextWithUnderlines} from "../../../utils/hymns/textParser";

const StanzaView = ({stanza, fontSizes}) => {
    const {colors} = useTheme().theme;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 24,
            alignItems: "center",
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        text: {
            textAlign: 'center',
            fontSize: fontSizes.text,
            lineHeight: fontSizes.lineHeight,
            color: colors.textSecondary,
        },
    }), [colors, fontSizes]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stanza {stanza.stanzaNumber}</Text>
            {/* FIXED: Changed colors.primary to colors.text for high contrast */}
            {renderTextWithUnderlines(stanza.text, stanza.underline, styles.text, colors.text)}
        </View>
    );
};

export default React.memo(StanzaView);