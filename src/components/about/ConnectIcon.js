import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from "../../context/ThemeContext";

export const ConnectIcon = ({name, icon, onPress}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        text: {
            color: colors.textSecondary,
            fontSize: 16,
        },
        card: {
            backgroundColor: colors.primary,
            borderRadius: 8,
            padding: 10,
            alignItems: 'center',
            flex: 1,
            marginHorizontal: 4,
            maxWidth: 120,
        },
    });

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <MaterialCommunityIcons
                name={icon}
                size={38}
                color={colors.textSecondary}
            />
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    );
}
