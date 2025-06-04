import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// User roles enum
export const USER_ROLES = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin'
};

export class UserManagementService {

    // Get all users (admin only)
    static async getAllUsers(pageSize = 50, lastDoc = null) {
        try {
            let q = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const querySnapshot = await getDocs(q);
            const users = [];

            querySnapshot.forEach((doc) => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                users,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Search users by email or name
    static async searchUsers(searchTerm) {
        try {
            const queries = [
                query(
                    collection(db, 'users'),
                    where('email', '>=', searchTerm),
                    where('email', '<=', searchTerm + '\uf8ff'),
                    limit(20)
                ),
                query(
                    collection(db, 'users'),
                    where('displayName', '>=', searchTerm),
                    where('displayName', '<=', searchTerm + '\uf8ff'),
                    limit(20)
                )
            ];

            const results = await Promise.all(queries.map(q => getDocs(q)));
            const users = new Map();

            results.forEach(querySnapshot => {
                querySnapshot.forEach(doc => {
                    users.set(doc.id, {
                        id: doc.id,
                        ...doc.data()
                    });
                });
            });

            return Array.from(users.values());
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }

    // Update user role (admin only)
    static async updateUserRole(userId, newRole) {
        try {
            if (!Object.values(USER_ROLES).includes(newRole)) {
                throw new Error('Invalid role specified');
            }

            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                role: newRole,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    // Get user by ID
    static async getUserById(userId) {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                return {
                    id: userDoc.id,
                    ...userDoc.data()
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    // Get users by role
    static async getUsersByRole(role) {
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', role),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const users = [];

            querySnapshot.forEach((doc) => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return users;
        } catch (error) {
            console.error('Error fetching users by role:', error);
            throw error;
        }
    }

    // Bulk update user roles (admin only)
    static async bulkUpdateUserRoles(updates) {
        try {
            const promises = updates.map(({ userId, role }) =>
                this.updateUserRole(userId, role)
            );

            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error bulk updating user roles:', error);
            throw error;
        }
    }

    // Get user statistics
    static async getUserStats() {
        try {
            const roles = Object.values(USER_ROLES);
            const promises = roles.map(role => this.getUsersByRole(role));
            const results = await Promise.all(promises);

            const stats = {};
            roles.forEach((role, index) => {
                stats[role] = results[index].length;
            });

            stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0);

            return stats;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    // Validate if user has required role
    static hasRole(user, requiredRole) {
        if (!user || !user.role) return false;

        const roleHierarchy = {
            [USER_ROLES.USER]: 1,
            [USER_ROLES.MODERATOR]: 2,
            [USER_ROLES.ADMIN]: 3
        };

        const userLevel = roleHierarchy[user.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    // Check if user can perform admin actions
    static canPerformAdminActions(user) {
        return this.hasRole(user, USER_ROLES.ADMIN);
    }

    // Check if user can moderate content
    static canModerateContent(user) {
        return this.hasRole(user, USER_ROLES.MODERATOR);
    }
}
