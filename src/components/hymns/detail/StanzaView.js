import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from "../../../context/ThemeContext";

const StanzaView = ({stanza, fontSizes}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
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
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stanza {stanza.stanzaNumber}</Text>
            <Text style={styles.text}>{stanza.text}</Text>
        </View>
    );
};


export default StanzaView;
