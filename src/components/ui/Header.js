import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "../../utils/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Header = ({
                    title,
                    showBack,
                    showRefresh,
                    showMenu,
                    onBack,
                    onRefresh,
                    onMenu,
                    onMore,
                    showMore = true,
                    moreIcon = "ellipsis-vertical",
                    modalContent // New prop for modal content
                }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleMorePress = () => {
        if (modalContent) {
            setModalVisible(true);
        }
        if (onMore) {
            onMore();
        }
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    return (
        <>
            <View style={styles.header}>
                <View style={styles.leftSection}>
                    {showMenu && (
                        <TouchableOpacity style={styles.iconButton} onPress={onMenu}>
                            <Ionicons name="menu" size={24} color="white"/>
                        </TouchableOpacity>
                    )}
                    {showBack && (
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <Ionicons name="arrow-back" size={24} color="white"/>
                        </TouchableOpacity>
                    )}
                </View>

                <Text ellipsizeMode='tail' numberOfLines={2} style={styles.title}>{title}</Text>

                <View style={styles.rightSection}>
                    {showRefresh && (
                        <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
                            <Ionicons name="refresh" size={24} color="white"/>
                        </TouchableOpacity>
                    )}
                    {showMore && (
                        <TouchableOpacity style={styles.iconButton} onPress={handleMorePress}>
                            <Ionicons name={moreIcon} size={24} color="white"/>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalContent}>
                                {modalContent && modalContent({ closeModal })}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.primary500,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        color: 'white',
        fontSize: 20,
        flex: 4,
        fontWeight: '600',
        textAlign: 'center',
    },
    iconButton: {
        padding: 8,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        minWidth: screenWidth * 0.8,
        maxWidth: screenWidth * 0.9,
        maxHeight: screenHeight * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default Header;
