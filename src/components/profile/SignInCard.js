import {StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useTheme} from "../../context/ThemeContext";
import {IconTextButton} from "../ui/IconTextButton";

export const SignInCard = ({onSignIn}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        signInTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 12,
            textAlign: 'center',
        },
        signInMessage: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
        },
        signInSection: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 32,
        },
        signInContainer: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 30,
            alignItems: 'center',
            marginTop: 20,
            elevation: 4,
        },
    });

    return (
        <View style={styles.signInSection}>
            <View style={styles.signInContainer}>
                    <Ionicons name="person-add-outline" size={48} color={colors.header}/>
                <Text style={styles.signInTitle}>Welcome to Hymns Collection</Text>
                <Text style={styles.signInMessage}>
                    Sign in to sync your favorites across devices and access personalized features
                </Text>
                <IconTextButton text={"Sign in with Google"} icon={"logo-google"} onPress={onSignIn}/>
            </View>
        </View>
    );
}

