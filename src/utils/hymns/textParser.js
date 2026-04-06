import React from 'react';
import { Text } from 'react-native';

export const renderTextWithUnderlines = (text, underlines, baseStyle, highlightColor) => {
    // If no underlines exist, just return the normal text
    if (!underlines || !Array.isArray(underlines) || underlines.length === 0 || !text) {
        return <Text style={baseStyle}>{text}</Text>;
    }

    // Normalize the array so strings become objects with occurrence: 1
    const targets = underlines.map(u => {
        if (typeof u === 'string') return { word: u, occurrence: 1 };
        return u;
    });

    let matchIndices = [];

    // Find the exact starting and ending position of every target word
    targets.forEach(target => {
        let currentIdx = -1;
        for (let i = 0; i < target.occurrence; i++) {
            currentIdx = text.indexOf(target.word, currentIdx + 1);
            if (currentIdx === -1) break;
        }

        if (currentIdx !== -1) {
            matchIndices.push({
                start: currentIdx,
                end: currentIdx + target.word.length,
            });
        }
    });

    // Sort left-to-right to build the text sequentially
    matchIndices.sort((a, b) => a.start - b.start);

    // Filter overlaps just in case of formatting errors in the database
    let validMatches = [];
    let lastEnd = 0;
    matchIndices.forEach(match => {
        if (match.start >= lastEnd) {
            validMatches.push(match);
            lastEnd = match.end;
        }
    });

    let currentIndex = 0;
    let result = [];

    // Slice the text into chunks of normal text and underlined text
    validMatches.forEach((match, index) => {
        if (match.start > currentIndex) {
            result.push(text.substring(currentIndex, match.start));
        }
        result.push(
            <Text
                key={`under-${index}`}
                style={{ textDecorationLine: 'underline', color: highlightColor, fontWeight: 'bold' }}
            >
                {text.substring(match.start, match.end)}
            </Text>
        );
        currentIndex = match.end;
    });

    if (currentIndex < text.length) {
        result.push(text.substring(currentIndex));
    }

    // Wrap everything in a parent Text component so React Native handles line-breaks properly
    return <Text style={baseStyle}>{result}</Text>;
};