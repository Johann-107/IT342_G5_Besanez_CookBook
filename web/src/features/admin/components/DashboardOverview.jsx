import { Users, Utensils, FolderOpen, Globe, Lock, CookingPot, ChefHat } from 'lucide-react';
import MiniChart from './MiniChart';
import RecentTable from './RecentTable';
import { formatRelativeTime } from '../../../shared/utils/formatRelativeTime';
import styles from '../AdminDashboard.module.css';
import LoadingScreen from '../../../shared/components/LoadingScreen';

const DashboardOverview = ({ stats, loading }) => {
    if (loading)
        return (
            <LoadingScreen
                icon={<ChefHat size={52} strokeWidth={1.3} />}
                message="Loading dashboard…"
                fullPage={false}
            />
        );
    if (!stats) return null;

    const statCards = [
        {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: <Users size={24} />,
            color: '#C97D4E',
            bg: '#FDE8D0',
            delta: `+${stats.newUsersLast7Days} this week`,
        },
        {
            label: 'Total Recipes',
            value: stats.totalRecipes,
            icon: <Utensils size={24} />,
            color: '#8BAF8D',
            bg: '#D5EBD6',
            delta: `+${stats.newRecipesLast7Days} this week`,
        },
        {
            label: 'Collections',
            value: stats.totalCollections,
            icon: <FolderOpen size={24} />,
            color: '#E8A742',
            bg: '#FDF1D0',
            delta: 'Total created',
        },
        {
            label: 'Public Recipes',
            value: stats.publicRecipes,
            icon: <Globe size={24} />,
            color: '#9B6BAB',
            bg: '#E8D5F5',
            delta: `${stats.privateRecipes} private`,
        },
    ];

    return (
        <div className={styles.overviewWrap}>
            <div className={styles.statGrid}>
                {statCards.map((card, i) => (
                    <div key={i} className={styles.statCard}>
                        <div
                            className={styles.statCardIcon}
                            style={{ background: card.bg, color: card.color }}
                        >
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

            <div className={styles.tablesRow}>
                <RecentTable
                    title="Recent Registrations"
                    rows={stats.recentUsers || []}
                    columns={['User', 'Email', 'Joined']}
                    renderRow={(u) => (
                        <>
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
                                    <div className={styles.recipeMiniThumb}>
                                        {r.imageUrl ? <img src={r.imageUrl} alt="" /> : <CookingPot size={20} />}
                                    </div>
                                    <span>{r.name}</span>
                                </div>
                            </td>
                            <td className={styles.td}>
                                {r.ownerFirstName} {r.ownerLastName}
                            </td>
                            <td className={styles.td}>
                                {r.public ? (
                                    <span className={styles.publicBadge}>
                                        <Globe size={14} /> Public
                                    </span>
                                ) : (
                                    <span className={styles.privateBadge}>
                                        <Lock size={14} /> Private
                                    </span>
                                )}
                            </td>
                            <td className={styles.td}>{formatRelativeTime(r.createdAt)}</td>
                        </>
                    )}
                />
            </div>
        </div>
    );
};

export default DashboardOverview;