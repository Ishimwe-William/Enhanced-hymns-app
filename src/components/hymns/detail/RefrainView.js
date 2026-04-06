import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from "../../../context/ThemeContext";
import {renderTextWithUnderlines} from "../../../utils/hymns/textParser";

const RefrainView = ({refrain, fontSizes}) => {
    const {colors} = useTheme().theme;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 20,
            marginHorizontal: 4,
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 3,
            borderLeftColor: colors.header,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
            gap: 6,
        },
        dot: {
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.header,
        },
        title: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.header,
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        text: {
            textAlign: 'center',
            fontSize: fontSizes.text,
            lineHeight: fontSizes.lineHeight,
            color: colors.text,
            fontStyle: 'italic',
        },
    }), [colors, fontSizes]);

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <View style={styles.dot} />
                <Text style={styles.title}>Refrain</Text>
                <View style={styles.dot} />
            </View>
            {renderTextWithUnderlines(refrain.text, refrain.underline, styles.text, colors.text)}
        </View>
    );
};

export default React.memo(RefrainView);