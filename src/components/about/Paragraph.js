import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from "../../context/ThemeContext";

export const Paragraph = ({title, style, children}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        descriptionStyle: {
            color: colors.textSecondary,
            fontSize: 16,
            lineHeight: 24,
        },
        titleStyle: {
            color: colors.header,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        card: {
            marginTop: 20,
            marginHorizontal: 20,
            flex: 1,
        },
    });

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.titleStyle}>{title}</Text>
            <Text style={styles.descriptionStyle}>
                {children}
            </Text>
        </View>
    );
};
