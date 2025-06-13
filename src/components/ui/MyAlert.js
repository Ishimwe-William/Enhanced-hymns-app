import React from 'react';
import { Alert as RNAlert } from 'react-native';

export const MyAlert = {
    show: (title, message, buttons = []) => {
        // Default button if none provided
        if (buttons.length === 0) {
            buttons = [{ text: 'OK', style: 'default' }];
        }

        RNAlert.alert(title, message, buttons);
    },

    // Convenience methods
    success: (message, onPress) => {
        RNAlert.alert('Success', message, [
            { text: 'OK', onPress }
        ]);
    },

    error: (message, onPress) => {
        RNAlert.alert('Error', message, [
            { text: 'OK', onPress }
        ]);
    },

    info: (message, onPress) => {
        RNAlert.alert('Info', message, [
            { text: 'OK', onPress }
        ]);
    },

    confirm: (title, message, onConfirm, onCancel) => {
        RNAlert.alert(title, message, [
            { text: 'Cancel', style: 'cancel', onPress: onCancel },
            { text: 'OK', onPress: onConfirm }
        ]);
    },

    destructiveConfirm: (title, message, onConfirm, onCancel, confirmText = 'Delete') => {
        RNAlert.alert(title, message, [
            { text: 'Cancel', style: 'cancel', onPress: onCancel },
            { text: confirmText, style: 'destructive', onPress: onConfirm }
        ]);
    }
};

export default MyAlert;
