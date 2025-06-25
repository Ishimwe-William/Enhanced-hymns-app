import {Text, View, StyleSheet} from "react-native";
import {formatTime} from "../../utils/formatTime";
import {useTheme} from "../../context/ThemeContext";

export const ProgressBar = ({progress, progressPercentage}) => {
    const {colors} = useTheme().theme;
    const styles = StyleSheet.create({
        progressBar: {
            height: 24,
            backgroundColor: colors.card,
            position: 'relative',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        progressFill: {
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            backgroundColor: colors.header,
            width: `${progressPercentage}%`,
        },
        timeContainer: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 8,
            zIndex: 1,
        },
        timeText: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.text,
            textShadowColor: 'rgba(255, 255, 255, 0.8)',
            textShadowOffset: {width: 0, height: 0},
            textShadowRadius: 2,
        },
        timeTextOnProgress: {
            color: colors.primary,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: {width: 0, height: 1},
            textShadowRadius: 1,
        },
    });

    // Calculate if text should be white (when over the progress fill)
    const currentTimeWidth = 60; // Approximate width of time text
    const totalWidth = 100; // Assuming 100% width
    const isCurrentTimeOnProgress = (currentTimeWidth / totalWidth * 100) < progressPercentage;
    const isDurationOnProgress = progressPercentage > 70;

    return (
        <View style={styles.container}>
            <View style={styles.progressBar}>
                <View style={styles.progressFill} />
                <View style={styles.timeContainer}>
                    <Text style={[
                        styles.timeText,
                        isCurrentTimeOnProgress && styles.timeTextOnProgress
                    ]}>
                        {formatTime(progress.position)}
                    </Text>
                    <Text style={[
                        styles.timeText,
                        isDurationOnProgress && styles.timeTextOnProgress
                    ]}>
                        {formatTime(progress.duration)}
                    </Text>
                </View>
            </View>
        </View>
    );
};
