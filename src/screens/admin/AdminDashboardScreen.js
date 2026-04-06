import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/ui/Header';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { UserManagementService } from '../../services/userManagementService';
import { useHymns } from '../../context/HymnContext';
import LoadingScreen from '../../components/LoadingScreen';

const StatCard = ({ icon, label, value, colors }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name={icon} size={22} color={colors.header} />
        </View>
        <View style={styles.statInfo}>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    </View>
);

const AdminDashboardScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigation = useNavigation();
    const { getLocalHymnCount } = useHymns();
    const [stats, setStats] = useState({ users: 0, hymns: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadStats(); }, []);

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

    if (loading) return <LoadingScreen message="Loading Admin Dashboard..." />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Admin Dashboard" showMenu onMenu={() => navigation.dispatch(DrawerActions.openDrawer())} showMore={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>OVERVIEW</Text>

                <StatCard icon="people-outline" label="Registered Users" value={stats.users} colors={colors} />
                <StatCard icon="musical-notes-outline" label="Local Hymns" value={stats.hymns} colors={colors} />

                <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="information-circle-outline" size={18} color={colors.header} style={{ marginRight: 8, marginTop: 1 }} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        To edit a hymn's lyrics or title, open the Hymn Detail screen — an edit button will appear for you there.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingTop: 20 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 14,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: { flex: 1 },
    statValue: { fontSize: 22, fontWeight: '700' },
    statLabel: { fontSize: 13, marginTop: 2 },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
});

export default AdminDashboardScreen;