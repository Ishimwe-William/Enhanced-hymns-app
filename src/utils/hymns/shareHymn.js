// src/utils/shareHymn.js

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Share, Alert } from 'react-native';

/**
 * Capture the given viewRef as a PNG, then open the native share dialog.
 * If expo-sharing is available, share via shareAsync; otherwise fallback to Share.share.
 *
 * @param {Object} viewRef - a React ref pointing to a <View> that we want to capture
 * @param {Object} hymn   - the hymn object ({ id, title, number, verses, ... })
 */
export async function shareHymnAsImage(viewRef, hymn) {
    try {
        // Give React Native a moment to render the view under viewRef
        await new Promise(res => setTimeout(res, 300));

        // captureRef → returns a temporary URI string (tmpfile://...)
        const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 0.9,
            result: 'tmpfile',
        });

        // Check if expo-sharing is available (iOS / Android)
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: `${hymn.title} - Hymn ${hymn.number}`,
            });
        } else {
            // Fallback to RN's Share API (some Android versions)
            await Share.share({
                title: `${hymn.title} - Hymn ${hymn.number}`,
                message: `Check out this hymn: "${hymn.title}" (Hymn ${hymn.number})`,
                url: uri,
            });
        }
    } catch (error) {
        console.error('Error sharing hymn as image:', error);
        Alert.alert(
            'Image Sharing Failed',
            'Unable to share hymn as image. You can try sharing as text instead.'
        );
        throw error;
    }
}

/**
 * Share hymn as plain text (lyrics + header).
 *
 * @param {Object} hymn - the hymn object ({ title, number, verses, ... })
 */
export async function shareHymnAsText(hymn) {
    try {
        // Build a text block including verse numbers
        const versesText = hymn.verses
            ? hymn.verses.map((verse, idx) => `${idx + 1}. ${verse}`).join('\n\n')
            : 'Check out this beautiful hymn!';

        const shareContent = {
            title: `${hymn.title} - Hymn ${hymn.number}`,
            message: `🎵 ${hymn.title} (Hymn ${hymn.number})\n\n${versesText}\n\nShared from Hymns App`,
        };

        await Share.share(shareContent);
    } catch (error) {
        console.error('Error sharing hymn as text:', error);
        Alert.alert('Error', 'Failed to share the hymn as text. Please try again later.');
        throw error;
    }
}
