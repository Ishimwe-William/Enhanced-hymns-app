import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/ui/Header';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { UserManagementService } from '../../services/userManagementService';
import { useHymns } from '../../context/HymnContext';
import LoadingScreen from '../../components/LoadingScreen';

const AdminDashboardScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigation = useNavigation();
    const { getLocalHymnCount } = useHymns();

    const [stats, setStats] = useState({ users: 0, hymns: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const userStats = await UserManagementService.getUserStats();
            const hymnCount = await getLocalHymnCount();
            setStats({ users: userStats.total || 0, hymns: hymnCount || 0 });
        } catch (error) {
            console.error("Error loading admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    if (loading) return <LoadingScreen message="Loading Admin Dashboard..." />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Admin Dashboard" showMenu onMenu={handleMenuPress} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Database Stats</Text>
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>Total Registered Users: {stats.users}</Text>
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>Total Local Hymns: {stats.hymns}</Text>
                </View>

                <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    Note: To edit a specific hymn's lyrics or title, navigate to the Hymns list, select the hymn, and an "Edit" button will appear for you at the top right of the Hymn Detail screen.
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    card: { padding: 20, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    statText: { fontSize: 16, marginBottom: 8 },
    instruction: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});

export default AdminDashboardScreen;