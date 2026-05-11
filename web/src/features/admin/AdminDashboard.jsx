import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import adminAPI from './admin';
import {
    LayoutDashboard,
    Users,
    Utensils,
    FolderOpen,
    LogOut,
    ChefHat,
} from 'lucide-react';
import DashboardOverview from './components/DashboardOverview';
import UsersManager from './components/UsersManager';
import RecipesManager from './components/RecipesManager';
import CollectionsManager from './components/CollectionsManager';
import styles from './AdminDashboard.module.css';

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
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'users', label: 'Users', icon: <Users size={18} /> },
        { id: 'recipes', label: 'Recipes', icon: <Utensils size={18} /> },
        { id: 'collections', label: 'Collections', icon: <FolderOpen size={18} /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <DashboardOverview stats={stats} loading={loading} />;
            case 'users':
                return <UsersManager />;
            case 'recipes':
                return <RecipesManager />;
            case 'collections':
                return <CollectionsManager />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <div className={styles.sidebarLogo}>
                        <ChefHat size={24} />
                    </div>
                    <div>
                        <div className={styles.sidebarTitle}>CookBook</div>
                        <div className={styles.sidebarBadge}>Admin Panel</div>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => (
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
                    <button className={styles.sidebarLogout} onClick={handleLogout}>
                        <LogOut size={16} style={{ marginRight: 6 }} />
                        Log Out
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                <div className={styles.topbar}>
                    <div className={styles.topbarLeft}>
                        <h1 className={styles.topbarTitle}>
                            {navItems.find((n) => n.id === activeSection)?.label}
                        </h1>
                    </div>
                    <div className={styles.topbarRight}>
                        <div className={styles.adminPill}>
                            <span className={styles.adminPillDot} />
                            Admin
                        </div>
                        <div className={styles.adminAvatar}>
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="avatar" />
                            ) : (
                                <span>
                                    {((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() ||
                                        'A'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.content}>{renderContent()}</div>
            </main>
        </div>
    );
};

export default AdminDashboard;