import {TouchableOpacity, Text, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useTheme} from "../../context/ThemeContext";

export const IconTextButton = ({icon, text, onPress, disabled = false}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.header,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        disabledButton: {
            backgroundColor: colors.header + '40',
        },
        icon: {
            fontSize: 20,
            marginRight: 8,
        },
        text: {
            color: colors.background,
            fontSize: 16,
            fontWeight: '600',
        },
    });
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabledButton]}
            onPress={onPress}
            disabled={disabled}
        >
            <Ionicons style={styles.icon} name={icon} color={colors.background} size={24}/>
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    );
}
