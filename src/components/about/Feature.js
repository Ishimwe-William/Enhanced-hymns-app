import {StyleSheet, View, Text} from 'react-native';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useTheme} from "../../context/ThemeContext";

export const Feature = ({title, icon, children}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        featureContainer: {
            width: '95%',
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginBottom: 10,
        },
        icon: {
            marginRight: 12,
        },
        title: {
            color: colors.text,
            fontSize: 18,
            lineHeight: 24,
            fontWeight: 'bold',
        },
        descriptionContainer: {
            width: "94%"
        },
        description: {
            color: colors.textSecondary,
            fontSize: 16,
            lineHeight: 24,
            marginBottom: 4,
        },
    });
    return (
        <View style={styles.featureContainer}>
            <MaterialCommunityIcons name={icon} size={24} color={colors.header} style={styles.icon}/>
            <View style={styles.descriptionContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{children}</Text>
            </View>
        </View>
    );
}
