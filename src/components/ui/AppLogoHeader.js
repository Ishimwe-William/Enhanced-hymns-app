import {Image, StyleSheet, Text, View} from "react-native";
import {MyConstants} from "../../utils/constants";
import {useTheme} from "../../context/ThemeContext";

export const AppLogoHeader = () => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        drawerImageContainer: {
            alignItems: 'center',
            paddingVertical: 10,
        },
        drawerImage: {
            width: 100,
            height: 100,
            borderRadius: 75,
            marginBottom: 10,
        },
        title: {
            fontSize: 24,
            fontFamily: 'Matura MT Script Capitals',
            textAlign: 'center',
            paddingHorizontal: 22,
        },
        versionText: {
            fontStyle: 'italic',
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
        },
    });


    return (
        <View style={[styles.drawerImageContainer, {backgroundColor: colors.primary}]}>
            <Image
                source={require('../../../assets/logo.png')}
                style={styles.drawerImage}
                resizeMode="cover"
            />
            <Text style={[styles.title, {color: colors.textSecondary}]}>
                {MyConstants.AppName}
            </Text>
            <Text style={styles.versionText}>
                {MyConstants.AppVersion}
            </Text>
        </View>
    );
}
