import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminAPI from '../services/admin';
import styles from '../styles/AdminDashboard.module.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        loadStats();
    }, [user]);

    const loadStats = async () => {
        try {
            const res = await adminAPI.getAdminStats();
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load stats', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'recipes', label: 'Recipes', icon: '📖' },
        { id: 'collections', label: 'Collections', icon: '📂' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return <DashboardOverview stats={stats} loading={loading} />;
            case 'users': return <UsersManager />;
            case 'recipes': return <RecipesManager />;
            case 'collections': return <CollectionsManager />;
            default: return null;
        }
    };

    return (
        <div className={styles.shell}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <div className={styles.sidebarLogo}>🍳</div>
                    <div>
                        <div className={styles.sidebarTitle}>CookBook</div>
                        <div className={styles.sidebarBadge}>Admin Panel</div>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link to="/dashboard" className={styles.sidebarFooterLink}>
                        🏠 User Dashboard
                    </Link>
                    <button className={styles.sidebarLogout} onClick={handleLogout}>
                        🚪 Log Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={styles.main}>
                <div className={styles.topbar}>
                    <div className={styles.topbarLeft}>
                        <h1 className={styles.topbarTitle}>
                            {navItems.find(n => n.id === activeSection)?.label}
                        </h1>
                    </div>
                    <div className={styles.topbarRight}>
                        <div className={styles.adminPill}>
                            <span className={styles.adminPillDot} />
                            Admin
                        </div>
                        <div className={styles.adminAvatar}>
                            {user?.profileImage
                                ? <img src={user.profileImage} alt="avatar" />
                                : <span>{((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() || 'A'}</span>
                            }
                        </div>
                    </div>
                </div>
                <div className={styles.content}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

// ─── Dashboard Overview ────────────────────────────────────────────────────────

const DashboardOverview = ({ stats, loading }) => {
    if (loading) return <div className={styles.loadingState}><span className={styles.spinner}>🍳</span> Loading dashboard…</div>;
    if (!stats) return null;

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#C97D4E', bg: '#FDE8D0', delta: `+${stats.newUsersLast7Days} this week` },
        { label: 'Total Recipes', value: stats.totalRecipes, icon: '📖', color: '#8BAF8D', bg: '#D5EBD6', delta: `+${stats.newRecipesLast7Days} this week` },
        { label: 'Collections', value: stats.totalCollections, icon: '📂', color: '#E8A742', bg: '#FDF1D0', delta: 'Total created' },
        { label: 'Public Recipes', value: stats.publicRecipes, icon: '🌐', color: '#9B6BAB', bg: '#E8D5F5', delta: `${stats.privateRecipes} private` },
    ];

    return (
        <div className={styles.overviewWrap}>
            {/* Stat Cards */}
            <div className={styles.statGrid}>
                {statCards.map((card, i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: card.bg, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className={styles.statCardBody}>
                            <div className={styles.statCardValue}>{card.value.toLocaleString()}</div>
                            <div className={styles.statCardLabel}>{card.label}</div>
                            <div className={styles.statCardDelta}>{card.delta}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Growth charts side by side */}
            <div className={styles.chartsRow}>
                <MiniChart
                    title="User Growth (last 30 days)"
                    data={stats.userGrowthLast30Days || []}
                    color="#C97D4E"
                    total={stats.newUsersLast30Days}
                    totalLabel="new users"
                />
                <MiniChart
                    title="Recipe Growth (last 30 days)"
                    data={stats.recipeGrowthLast30Days || []}
                    color="#8BAF8D"
                    total={stats.newRecipesLast30Days}
                    totalLabel="new recipes"
                />
            </div>

            {/* Recent activity tables */}
            <div className={styles.tablesRow}>
                <RecentTable
                    title="Recent Registrations"
                    rows={stats.recentUsers || []}
                    columns={['User', 'Email', 'Level', 'Joined']}
                    renderRow={(u) => (
                        <>
                            <td className={styles.td}>
                                <div className={styles.userCell}>
                                    <div className={styles.miniAvatar}>
                                        {u.profileImage
                                            ? <img src={u.profileImage} alt="" />
                                            : <span>{((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase()}</span>
                                        }
                                    </div>
                                    <span>{u.firstName} {u.lastName}</span>
                                </div>
                            </td>
                            <td className={styles.td}>{u.email}</td>
                            <td className={styles.td}><span className={styles.levelBadge}>{u.cookingLevel}</span></td>
                            <td className={styles.td}>{formatRelativeTime(u.joinedAt)}</td>
                        </>
                    )}
                />
                <RecentTable
                    title="Recent Recipes"
                    rows={stats.recentRecipes || []}
                    columns={['Recipe', 'Owner', 'Visibility', 'Created']}
                    renderRow={(r) => (
                        <>
                            <td className={styles.td}>
                                <div className={styles.recipeCell}>
                                    <div className={styles.recipeMiniThumb}>{r.imageUrl ? <img src={r.imageUrl} alt="" /> : '🍳'}</div>
                                    <span>{r.name}</span>
                                </div>
                            </td>
                            <td className={styles.td}>{r.ownerFirstName} {r.ownerLastName}</td>
                            <td className={styles.td}>
                                <span className={r.isPublic ? styles.publicBadge : styles.privateBadge}>
                                    {r.isPublic ? '🌐 Public' : '🔒 Private'}
                                </span>
                            </td>
                            <td className={styles.td}>{formatRelativeTime(r.createdAt)}</td>
                        </>
                    )}
                />
            </div>
        </div>
    );
};

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────

const MiniChart = ({ title, data, color, total, totalLabel }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    return (
        <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
                <div className={styles.chartTitle}>{title}</div>
                <div className={styles.chartTotal} style={{ color }}>
                    <strong>{total}</strong> {totalLabel}
                </div>
            </div>
            <div className={styles.barChart}>
                {data.map((point, i) => (
                    <div key={i} className={styles.barWrap} title={`${point.date}: ${point.count}`}>
                        <div
                            className={styles.bar}
                            style={{
                                height: `${Math.max((point.count / maxCount) * 100, point.count > 0 ? 8 : 2)}%`,
                                background: point.count > 0 ? color : '#EDD8C4',
                                opacity: point.count > 0 ? 0.75 + (i / data.length) * 0.25 : 0.3,
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.chartXLabels}>
                <span>30d ago</span>
                <span>15d ago</span>
                <span>Today</span>
            </div>
        </div>
    );
};

// ─── Recent Table ──────────────────────────────────────────────────────────────

const RecentTable = ({ title, rows, columns, renderRow }) => (
    <div className={styles.tableCard}>
        <div className={styles.tableCardTitle}>{title}</div>
        <table className={styles.table}>
            <thead>
                <tr>
                    {columns.map(col => <th key={col} className={styles.th}>{col}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className={styles.tr}>{renderRow(row)}</tr>
                ))}
            </tbody>
        </table>
    </div>
);

// ─── Users Manager ─────────────────────────────────────────────────────────────

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
                page, size: 10, sort: 'createdAt,desc',
                ...(search.trim() && { search: search.trim() }),
            });
            setUsers(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, search]);
    useEffect(() => { setPage(0); }, [search]);

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}"? This will also delete all their recipes and collections.`)) return;
        setActionLoading(userId);
        try {
            await adminAPI.deleteAdminUser(userId);
            setUsers(prev => prev.filter(u => u.userId !== userId));
        } catch { alert('Failed to delete user.'); }
        finally { setActionLoading(null); }
    };

    const handleToggleRole = async (userId) => {
        setActionLoading(userId);
        try {
            const res = await adminAPI.toggleUserRole(userId);
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, ...res.data } : u));
        } catch { alert('Failed to toggle role.'); }
        finally { setActionLoading(null); }
    };

    return (
        <div className={styles.managerWrap}>
            <div className={styles.managerHeader}>
                <div className={styles.managerInfo}>
                    <span className={styles.managerCount}>{totalElements} users total</span>
                </div>
                <input
                    className={styles.searchBar}
                    placeholder="🔍 Search by name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? <div className={styles.loadingState}><span className={styles.spinner}>⏳</span> Loading…</div> : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['User', 'Email', 'Level', 'Role', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.userId} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.userCell}>
                                            <div className={styles.miniAvatar}>
                                                {u.profileImage
                                                    ? <img src={u.profileImage} alt="" />
                                                    : <span>{((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase()}</span>
                                                }
                                            </div>
                                            <span>{u.firstName} {u.lastName}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>{u.email}</td>
                                    <td className={styles.td}><span className={styles.levelBadge}>{u.cookingLevel}</span></td>
                                    <td className={styles.td}>
                                        <span className={u.role === 'ADMIN' ? styles.adminRoleBadge : styles.userRoleBadge}>
                                            {u.role === 'ADMIN' ? '⭐ Admin' : '👤 User'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{formatRelativeTime(u.createdAt || u.joinedAt)}</td>
                                    <td className={styles.td}>
                                        <div className={styles.actionBtns}>
                                            <button
                                                className={styles.btnToggleRole}
                                                onClick={() => handleToggleRole(u.userId)}
                                                disabled={actionLoading === u.userId}
                                                title={u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                                            >
                                                {actionLoading === u.userId ? '⏳' : u.role === 'ADMIN' ? '👤' : '⭐'}
                                            </button>
                                            <button
                                                className={styles.btnDelete}
                                                onClick={() => handleDelete(u.userId, `${u.firstName} ${u.lastName}`)}
                                                disabled={actionLoading === u.userId}
                                                title="Delete user"
                                            >
                                                🗑
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

// ─── Recipes Manager ───────────────────────────────────────────────────────────

const RecipesManager = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAdminRecipes({
                page, size: 10, sort: 'createdAt,desc',
                ...(search.trim() && { search: search.trim() }),
            });
            setRecipes(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, search]);
    useEffect(() => { setPage(0); }, [search]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete recipe "${name}"? This cannot be undone.`)) return;
        setActionLoading(id);
        try {
            await adminAPI.deleteAdminRecipe(id);
            setRecipes(prev => prev.filter(r => r.id !== id));
        } catch { alert('Failed to delete recipe.'); }
        finally { setActionLoading(null); }
    };

    return (
        <div className={styles.managerWrap}>
            <div className={styles.managerHeader}>
                <span className={styles.managerCount}>{totalElements} recipes total</span>
                <input
                    className={styles.searchBar}
                    placeholder="🔍 Search by recipe name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {loading ? <div className={styles.loadingState}><span className={styles.spinner}>⏳</span> Loading…</div> : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['Recipe', 'Owner ID', 'Visibility', 'Created', 'Actions'].map(h => (
                                    <th key={h} className={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recipes.map(r => (
                                <tr key={r.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.recipeCell}>
                                            <div className={styles.recipeMiniThumb}>
                                                {r.imageUrl ? <img src={r.imageUrl} alt="" /> : '🍳'}
                                            </div>
                                            <span>{r.name}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}><span className={styles.idChip}>#{r.userId}</span></td>
                                    <td className={styles.td}>
                                        <span className={r.isPublic ? styles.publicBadge : styles.privateBadge}>
                                            {r.isPublic ? '🌐 Public' : '🔒 Private'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{formatRelativeTime(r.createdAt)}</td>
                                    <td className={styles.td}>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() => handleDelete(r.id, r.name)}
                                            disabled={actionLoading === r.id}
                                        >
                                            {actionLoading === r.id ? '⏳' : '🗑'}
                                        </button>
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

// ─── Collections Manager ───────────────────────────────────────────────────────

const CollectionsManager = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAdminCollections({ page, size: 10, sort: 'createdAt,desc' });
            setCollections(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [page]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete collection "${name}"? This cannot be undone.`)) return;
        setActionLoading(id);
        try {
            await adminAPI.deleteAdminCollection(id);
            setCollections(prev => prev.filter(c => c.id !== id));
        } catch { alert('Failed to delete collection.'); }
        finally { setActionLoading(null); }
    };

    return (
        <div className={styles.managerWrap}>
            <div className={styles.managerHeader}>
                <span className={styles.managerCount}>{totalElements} collections total</span>
            </div>
            {loading ? <div className={styles.loadingState}><span className={styles.spinner}>⏳</span> Loading…</div> : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['Collection', 'Owner ID', 'Recipes', 'Created', 'Actions'].map(h => (
                                    <th key={h} className={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map(c => (
                                <tr key={c.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.collectionCell}>
                                            <div className={styles.collMiniThumb}>
                                                {c.coverImage ? <img src={c.coverImage} alt="" /> : '📂'}
                                            </div>
                                            <div>
                                                <div className={styles.collName}>{c.name}</div>
                                                {c.description && <div className={styles.collDesc}>{c.description.slice(0, 50)}{c.description.length > 50 ? '…' : ''}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}><span className={styles.idChip}>#{c.userId}</span></td>
                                    <td className={styles.td}><span className={styles.countChip}>{c.recipeCount}</span></td>
                                    <td className={styles.td}>{formatRelativeTime(c.createdAt)}</td>
                                    <td className={styles.td}>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() => handleDelete(c.id, c.name)}
                                            disabled={actionLoading === c.id}
                                        >
                                            {actionLoading === c.id ? '⏳' : '🗑'}
                                        </button>
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

// ─── Pagination ────────────────────────────────────────────────────────────────

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => onPageChange(p => p - 1)} disabled={page === 0}>← Prev</button>
            <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
            <button className={styles.pageBtn} onClick={() => onPageChange(p => p + 1)} disabled={page >= totalPages - 1}>Next →</button>
        </div>
    );
};

// ─── Utils ─────────────────────────────────────────────────────────────────────

const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 30) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};

export default AdminDashboard;