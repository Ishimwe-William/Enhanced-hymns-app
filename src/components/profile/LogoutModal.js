import {Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useTheme} from "../../context/ThemeContext";

export const LogoutModal = ({showLogoutModal, handleCancelLogout, signingOut, handleConfirmLogout}) => {
    const {colors} = useTheme().theme;
    const {width} = useWindowDimensions();

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },

        modalContainer: {
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: 24,
            width: width - 40,
            maxWidth: 340,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 4,
            },

            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
        },
        modalHeader: {
            alignItems: 'center',
            marginBottom: 24,
        }, modalIconContainer: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#FFF0F0',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        modalMessage: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },

        cancelButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: '#F5F5F5',
            borderRadius: 8,
            alignItems: 'center',
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
        },
        confirmButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: '#FF3B30',
            borderRadius: 8,
            alignItems: 'center',
        },
        confirmButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: 'white',
        },
        disabledButton: {
            backgroundColor: '#FF6B6B',
            opacity: 0.7,
        },

        loadingContainer: {
            alignItems: 'center',
        },
    });

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showLogoutModal}
            onRequestClose={handleCancelLogout}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="log-out-outline" size={32} color="#FF3B30"/>
                        </View>
                        <Text style={styles.modalTitle}>Sign Out</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to sign out of your account?
                        </Text>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelLogout}
                            disabled={signingOut}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, signingOut && styles.disabledButton]}
                            onPress={handleConfirmLogout}
                            disabled={signingOut}
                        >
                            {signingOut ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.confirmButtonText}>Signing out...</Text>
                                </View>
                            ) : (
                                <Text style={styles.confirmButtonText}>Sign Out</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
