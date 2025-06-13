import { Linking } from 'react-native';
import MyAlert from '../../components/ui/MyAlert';
import { shareHymnAsImage, shareHymnAsText } from '../hymns/shareHymn';
import Constants from 'expo-constants';

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
                { text: 'Cancel', style: 'cancel' },
                { text: 'Share as Image', onPress: this.beginImageShare },
                { text: 'Share as Text', onPress: this.beginTextShare },
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
                { text: 'Cancel', style: 'cancel' },
                { text: 'Email', onPress: this.handleEmailFeedback },
                { text: 'In-App Form', onPress: this.handleInAppFeedback },
            ]
        );
    };

    handleEmailFeedback = () => {
        const subject = `Feedback for Hymn ${this.hymn.number} - ${this.hymn.title}`;
        const body = `I would like to provide feedback about Hymn ${this.hymn.number} - "${this.hymn.title}":\n\n`;

        const mailtoUrl = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailtoUrl).catch(() => {
            MyAlert.info(`Please send your feedback to: ${this.email}`);
        });
    };

    handleInAppFeedback = () => {
        MyAlert.info(`Please send your feedback to: ${this.email}`);
    };
}
