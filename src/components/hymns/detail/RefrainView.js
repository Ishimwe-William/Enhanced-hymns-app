import React, {useMemo} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {useTheme} from "../../../context/ThemeContext";
import {renderTextWithUnderlines} from "../../../utils/hymns/textParser";

const RefrainView = ({ refrain, fontSizes }) => {
    const {colors} = useTheme().theme;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 24,
            alignItems: 'center',
            paddingLeft: 16,
            borderLeftWidth: 3,
            borderLeftColor: colors.header,
        },
        title: {
            fontSize: fontSizes.text,
            fontWeight: '600',
            color: colors.header,
            marginBottom: 8,
        },
        text: {
            textAlign: 'center',
            fontSize: fontSizes.text,
            lineHeight: fontSizes.lineHeight,
            color: colors.textSecondary,
            fontStyle: 'italic',
        },
    }), [colors, fontSizes]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Refrain</Text>
            {/* FIXED: Changed colors.primary to colors.text */}
            {renderTextWithUnderlines(refrain.text, refrain.underline, styles.text, colors.text)}
        </View>
    );
};

export default React.memo(RefrainView);