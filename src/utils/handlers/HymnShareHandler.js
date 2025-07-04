import {Linking} from 'react-native';
import MyAlert from '../../components/ui/MyAlert';
import {shareHymnAsImage, shareHymnAsText} from '../hymns/shareHymn';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';

export class HymnShareHandler {
    constructor(hymn, viewShotRef, setIsCapturing) {
        this.hymn = hymn;
        this.viewShotRef = viewShotRef;
        this.setIsCapturing = setIsCapturing;
        this.email = Constants.expoConfig.extra.EXPO_PUBLIC_FEEDBACK_EMAIL || 'bunsenplus.org@gmail.com';
    }

    handleShare = () => {
        if (!this.hymn) {
            MyAlert.error('Hymn data is not loaded yet.');
            return;
        }

        MyAlert.show(
            'Share Hymn',
            'How would you like to share this hymn?',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Share as Image', onPress: this.beginImageShare},
                {text: 'Share as Text', onPress: this.beginTextShare},
            ]
        );
    };

    beginImageShare = async () => {
        this.setIsCapturing(true);

        setTimeout(async () => {
            try {
                if (this.viewShotRef.current) {
                    await shareHymnAsImage(this.viewShotRef.current, this.hymn);
                } else {
                    MyAlert.error('Could not find the view to capture.');
                }
            } catch (err) {
                // shareHymnAsImage already shows an alert on failure
            } finally {
                this.setIsCapturing(false);
            }
        }, 300);
    };

    beginTextShare = async () => {
        try {
            await shareHymnAsText(this.hymn);
        } catch (err) {
            // shareHymnAsText already shows alert on failure
        }
    };

    handleFeedback = () => {
        MyAlert.show(
            'Send Feedback',
            'How would you like to send your feedback?',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Email', onPress: this.handleEmailFeedback},
                {text: 'In-App Form', onPress: this.handleInAppFeedback},
            ]
        );
    };

    handleEmailFeedback = () => {
        const subject = `Feedback for Hymn ${this.hymn.number} - ${this.hymn.title}`;
        const body = this.generateFeedbackEmailBody();

        const mailtoUrl = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.canOpenURL(mailtoUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(mailtoUrl);
                } else {
                    throw new Error('Email client not available');
                }
            })
            .catch((error) => {
                console.error('Email feedback failed:', error);
                MyAlert.show(
                    'Email Not Available',
                    `Please send your feedback manually to: ${this.email}`,
                    [
                        {text: 'OK', style: 'default'},
                        {
                            text: 'Copy Email',
                            onPress: () => this.copyEmailToClipboard()
                        }
                    ]
                );
            });
    }

    /**
     * Shows in-app feedback information
     */
    handleInAppFeedback() {
        MyAlert.show(
            'Send Feedback',
            `Please send your feedback to: ${this.email}`,
            [
                {text: 'OK', style: 'default'},
                {
                    text: 'Copy Email',
                    onPress: () => this.copyEmailToClipboard()
                }
            ]
        );
    }

    /**
     * Generates email body template for feedback
     * @returns {string} formatted email body
     */
    generateFeedbackEmailBody() {
        const hymnInfo = `Hymn ${this.hymn.number} - "${this.hymn.title}"`;

        return `I would like to provide feedback about ${hymnInfo}:
            Feedback Type: [Bug Report / Feature Request / General Feedback]
            
            Description:
            [Please describe your feedback here]
            
            Additional Information:
            - Hymn Number: ${this.hymn.number}
            - Hymn Title: ${this.hymn.title}
            - App Version: ${Constants.expoConfig.extra?.EXPO_PUBLIC_APP_VERSION || 'Unknown'}
            
            Thank you for your time!`;
    }

    /**
     * Copies email address to clipboard
     */
    async copyEmailToClipboard() {
        try {
            await Clipboard.setStringAsync(this.email);
            MyAlert.success('Email address copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy email:', error);
            MyAlert.error('Failed to copy email address.');
        }
    }
}
