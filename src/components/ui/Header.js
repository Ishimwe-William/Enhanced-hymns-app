import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../../context/ThemeContext";

const Header = ({
                    title,
                    showBack,
                    showRefresh,
                    showMenu,
                    showEdit,
                    onBack,
                    onRefresh,
                    onMenu,
                    onEdit,
                    onMore,
                    showMore = true,
                    moreIcon = "ellipsis-vertical",
                    modalContent
                }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { theme } = useTheme();
    const { colors } = theme;
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const styles = StyleSheet.create({
        header: {
            backgroundColor: colors.card,
            paddingHorizontal: 4,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 3,
        },
        leftSection: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        rightSection: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
        },
        title: {
            color: colors.text,
            fontSize: 18,
            flex: 4,
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: 0.2,
        },
        iconButton: {
            padding: 8,
            borderRadius: 20,
            margin: 2,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            minWidth: screenWidth * 0.8,
            maxWidth: screenWidth * 0.9,
            maxHeight: screenHeight * 0.8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
        },
        editPill: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.header + '20',
            borderRadius: 16,
            paddingHorizontal: 10,
            paddingVertical: 6,
            gap: 4,
        },
        editPillText: {
            fontSize: 12,
            fontWeight: '600',
        },
    });

    const handleMorePress = () => {
        if (modalContent) setModalVisible(true);
        if (onMore) onMore();
    };

    return (
        <>
            <View style={styles.header}>
                <View style={styles.leftSection}>
                    {showMenu && (
                        <TouchableOpacity style={styles.iconButton} onPress={onMenu}>
                            <Ionicons name="menu-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    {showBack && (
                        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>

                <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
                    {title}
                </Text>

                <View style={styles.rightSection}>
                    {showRefresh && (
                        <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
                            <Ionicons name="refresh-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    {showEdit && (
                        <TouchableOpacity
                            style={[styles.iconButton, styles.editPill]}
                            onPress={onEdit}
                        >
                            <Ionicons name="pencil-outline" size={14} color={colors.header} />
                            <Text style={[styles.editPillText, { color: colors.header }]}>Edit</Text>
                        </TouchableOpacity>
                    )}
                    {showMore && (
                        <TouchableOpacity style={styles.iconButton} onPress={handleMorePress}>
                            <Ionicons name={moreIcon} size={22} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalContent}>
                                {modalContent && modalContent({ closeModal: () => setModalVisible(false) })}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

export default Header;