import { useState, useEffect } from 'react';
import { Star, User, Trash2, Loader2 } from 'lucide-react';
import adminAPI from '../../services/admin';
import Pagination from './Pagination';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import styles from '../../styles/AdminDashboard.module.css';

const UsersManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAdminUsers({
                page,
                size: 10,
                sort: 'createdAt,desc',
                ...(search.trim() && { search: search.trim() }),
            });
            // Fix: data is nested under 'page' for pagination
            const pageData = res.data.page ?? res.data;  // fallback in case shape changes
            setUsers(res.data.content ?? []);
            setTotalPages(pageData.totalPages ?? 0);
            setTotalElements(pageData.totalElements ?? 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [page, search]);
    useEffect(() => {
        setPage(0);
    }, [search]);

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}"? This will also delete all their recipes and collections.`))
            return;
        setActionLoading(userId);
        try {
            await adminAPI.deleteAdminUser(userId);
            setUsers((prev) => prev.filter((u) => u.userId !== userId));
        } catch {
            alert('Failed to delete user.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleRole = async (userId) => {
        setActionLoading(userId);
        try {
            const res = await adminAPI.toggleUserRole(userId);
            setUsers((prev) =>
                prev.map((u) => (u.userId === userId ? { ...u, ...res.data } : u))
            );
        } catch {
            alert('Failed to toggle role.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={styles.managerWrap}>
            <div className={styles.managerHeader}>
                <div className={styles.managerInfo}>
                    <span className={styles.managerCount}>{totalElements} users total</span>
                </div>
                <input
                    className={styles.searchBar}
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className={styles.loadingState}>
                    <span className={styles.spinner}>
                        <Loader2 size={24} />
                    </span>{' '}
                    Loading…
                </div>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['User', 'Email', 'Level', 'Role', 'Joined', 'Actions'].map((h) => (
                                    <th key={h} className={styles.th}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.userId} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.userCell}>
                                            <div className={styles.miniAvatar}>
                                                {u.profileImage ? (
                                                    <img src={u.profileImage} alt="" />
                                                ) : (
                                                    <span>
                                                        {(
                                                            (u.firstName?.[0] || '') + (u.lastName?.[0] || '')
                                                        ).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span>
                                                {u.firstName} {u.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>{u.email}</td>
                                    <td className={styles.td}>
                                        <span className={styles.levelBadge}>{u.cookingLevel}</span>
                                    </td>
                                    <td className={styles.td}>
                                        {u.role === 'ADMIN' ? (
                                            <span className={styles.adminRoleBadge}>
                                                <Star size={14} /> Admin
                                            </span>
                                        ) : (
                                            <span className={styles.userRoleBadge}>
                                                <User size={14} /> User
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.td}>
                                        {u.createdAt || u.joinedAt
                                            ? formatRelativeTime(u.createdAt || u.joinedAt)
                                            : '—'}
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actionBtns}>
                                            <button
                                                className={styles.btnToggleRole}
                                                onClick={() => handleToggleRole(u.userId)}
                                                disabled={actionLoading === u.userId}
                                                title={
                                                    u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'
                                                }
                                            >
                                                {actionLoading === u.userId ? (
                                                    <Loader2 size={16} />
                                                ) : u.role === 'ADMIN' ? (
                                                    <User size={16} />
                                                ) : (
                                                    <Star size={16} />
                                                )}
                                            </button>
                                            <button
                                                className={styles.btnDelete}
                                                onClick={() =>
                                                    handleDelete(u.userId, `${u.firstName} ${u.lastName}`)
                                                }
                                                disabled={actionLoading === u.userId}
                                                title="Delete user"
                                            >
                                                {actionLoading === u.userId ? (
                                                    <Loader2 size={16} />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </div>
    );
};

export default UsersManager;