
// src/theme/metrics.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default {
    screenWidth: width,
    screenHeight: height,
    padding: {
        small: 8,
        default: 16,
        medium: 24,
        large: 32,
    },
    borderRadius: {
        small: 4,
        default: 8,
        large: 16,
    },
};