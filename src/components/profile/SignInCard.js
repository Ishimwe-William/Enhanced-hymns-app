import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useTheme} from "../../context/ThemeContext";

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
        signInButton: {
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
        signInButtonIcon: {
            marginRight: 8,
        },
        signInButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: '600',
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
                <TouchableOpacity style={styles.signInButton} onPress={onSignIn}>
                    <Ionicons name="logo-google" size={20} color={colors.background} style={styles.signInButtonIcon}/>
                    <Text style={styles.signInButtonText}>Sign in with Google</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

