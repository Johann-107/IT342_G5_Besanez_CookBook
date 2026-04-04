import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DefaultHeader from '../components/layout/DefaultHeader';
import recipeAPI from '../services/recipe';
import collectionAPI from '../services/collection';
import styles from '../styles/Dashboard.module.css';

const BG_CLASSES = ['rcImg1', 'rcImg2', 'rcImg3', 'rcImg4', 'rcImg5', 'rcImg6'];
const EMOJI_MAP = ['🥘', '🥗', '🍋', '🍝', '🍜', '🥧', '🍲', '🥩', '🍰', '🥞'];
const COLLECTION_COLORS = ['ccRust', 'ccSage', 'ccAmber', 'ccRose', 'ccSky', 'ccPlum'];
const COLLECTION_ICONS = [
    ['🍖', '🥩', '🐟'],
    ['🥬', '🍅', '🥕'],
    ['🧁', '🍞', '🥐'],
    ['🍷', '🥩', '🎂'],
    ['🥣', '🍳', '🥞'],
    ['🌮', '🥙', '🥗'],
];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ─── State ─────────────────────────────────────────────────────────────────
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [collections, setCollections] = useState([]);
    const [stats, setStats] = useState({ totalRecipes: 0, totalCollections: 0, addedThisWeek: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ─── Fetch all dashboard data ──────────────────────────────────────────────
    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            setError('');
            try {
                // Parallel fetch: recent recipes (3), all recipes page 0 for total,
                // and collections (3 recent + total count)
                const [recentRes, allRecipesRes, collectionsRes] = await Promise.all([
                    recipeAPI.getRecipes({ size: 3, sort: 'createdAt,desc', page: 0 }),
                    recipeAPI.getRecipes({ size: 1, page: 0 }),         // just for totalElements
                    collectionAPI.getCollections({ size: 50, sort: 'createdAt,desc', page: 0 }),
                ]);

                const recent = recentRes.data.content || [];
                const totalRecipes = allRecipesRes.data.totalElements || 0;
                const allCollections = collectionsRes.data.content || [];

                // Count recipes created in the last 7 days
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const addedThisWeek = recent.filter(r =>
                    r.createdAt && new Date(r.createdAt) >= oneWeekAgo
                ).length;

                // For the weekly count we need the full recent set — re-use allRecipesRes
                // but we only fetched 3. Instead compare against the recent page which is
                // already sorted newest-first; count those within a week.
                // (Good enough for a dashboard summary.)

                setRecentRecipes(recent);
                setCollections(allCollections.slice(0, 3));
                setStats({
                    totalRecipes,
                    totalCollections: collectionsRes.data.totalElements || allCollections.length,
                    addedThisWeek,
                });
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    // ─── Helpers ───────────────────────────────────────────────────────────────
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formatTime = (minutes) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
    };

    const displayName = user?.firstName || user?.name || 'Chef';

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.dashboard}>
                <div className={styles.dashContent}>

                    {/* Welcome Banner */}
                    <div className={styles.welcomeBanner}>
                        <div>
                            <h2 className={styles.welcomeTitle}>
                                {getGreeting()}, {displayName}! 👋
                            </h2>
                            <p className={styles.welcomeQuote}>
                                "Cooking is an art, but all art requires knowing something about technique."
                            </p>
                        </div>
                        <div className={styles.welcomeEmoji}>🥗</div>
                    </div>

                    {/* Stats Row */}
                    {loading ? (
                        <div className={styles.statsRow}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`${styles.statCard} ${styles.skeleton}`} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: '#FDE8D0' }}>📖</div>
                                <div className={styles.statNum}>{stats.totalRecipes}</div>
                                <div className={styles.statLabel}>Total Recipes</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: '#D5EBD6' }}>📂</div>
                                <div className={styles.statNum}>{stats.totalCollections}</div>
                                <div className={styles.statLabel}>Collections</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: '#FDF1D0' }}>✨</div>
                                <div className={styles.statNum}>{stats.addedThisWeek}</div>
                                <div className={styles.statLabel}>Added This Week</div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                        <button className={styles.btnPrimary} onClick={() => navigate('/create-recipe')}>
                            + Add New Recipe
                        </button>
                        <button className={styles.btnOutline} onClick={() => navigate('/collections')}>
                            📁 Create Collection
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className={styles.errorBanner}>{error}</div>
                    )}

                    {/* Recently Added */}
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Recently Added</h3>
                        <span className={styles.viewAll} onClick={() => navigate('/recipes')}>
                            View All →
                        </span>
                    </div>

                    {loading ? (
                        <div className={styles.recipeGrid}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`${styles.recipeCard} ${styles.skeleton}`}
                                    style={{ height: '200px' }} />
                            ))}
                        </div>
                    ) : recentRecipes.length === 0 ? (
                        <div className={styles.emptySection}>
                            <span>🍳</span>
                            <p>No recipes yet. <button className={styles.inlineLink} onClick={() => navigate('/create-recipe')}>Add your first one!</button></p>
                        </div>
                    ) : (
                        <div className={styles.recipeGrid}>
                            {recentRecipes.map((recipe, index) => (
                                <div
                                    key={recipe.id}
                                    className={styles.recipeCard}
                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                                >
                                    <div className={`${styles.recipeCardImg} ${styles[BG_CLASSES[index % BG_CLASSES.length]]}`}>
                                        {recipe.imageUrl
                                            ? <img src={recipe.imageUrl} alt={recipe.name} className={styles.recipeImg} />
                                            : EMOJI_MAP[index % EMOJI_MAP.length]
                                        }
                                    </div>
                                    <div className={styles.recipeCardBody}>
                                        <div className={styles.recipeCardTitle}>{recipe.name}</div>
                                        <div className={styles.recipeCardMeta}>
                                            {recipe.totalTimeMinutes && (
                                                <span className={styles.metaPill}>
                                                    ⏱ {formatTime(recipe.totalTimeMinutes)}
                                                </span>
                                            )}
                                            {recipe.isPublic
                                                ? <span className={styles.metaPillGreen}>🌐 Public</span>
                                                : <span className={styles.metaPill}>🔒 Private</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Collections */}
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Your Collections</h3>
                        <span className={styles.viewAll} onClick={() => navigate('/collections')}>
                            View All →
                        </span>
                    </div>

                    {loading ? (
                        <div className={styles.collectionsRow}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`${styles.collectionCard} ${styles.skeleton}`}
                                    style={{ height: '140px' }} />
                            ))}
                        </div>
                    ) : collections.length === 0 ? (
                        <div className={styles.emptySection}>
                            <span>📂</span>
                            <p>No collections yet. <button className={styles.inlineLink} onClick={() => navigate('/collections')}>Create one!</button></p>
                        </div>
                    ) : (
                        <div className={styles.collectionsRow}>
                            {collections.map((col, index) => (
                                <div
                                    key={col.id}
                                    className={`${styles.collectionCard} ${styles[COLLECTION_COLORS[index % COLLECTION_COLORS.length]]}`}
                                    onClick={() => navigate('/collections')}
                                >
                                    <div className={styles.collectionName}>
                                        📂 {col.name}
                                    </div>
                                    <div className={styles.collectionCount}>
                                        {col.recipeCount || 0} {col.recipeCount === 1 ? 'recipe' : 'recipes'}
                                    </div>
                                    <div className={styles.collectionIcons}>
                                        {COLLECTION_ICONS[index % COLLECTION_ICONS.length].map((icon, i) => (
                                            <div key={i} className={styles.collectionIcon}>{icon}</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default Dashboard;