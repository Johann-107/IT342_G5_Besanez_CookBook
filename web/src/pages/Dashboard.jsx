import { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Sample data based on the UI template
    const recentRecipes = [
        { id: 1, title: 'Moroccan Lamb Tagine', time: '45m', ingredients: 12, emoji: '🥘', class: 'rcImg1' },
        { id: 2, title: 'Summer Panzanella', time: '20m', ingredients: 8, emoji: '🥗', class: 'rcImg2' },
        { id: 3, title: 'Lemon Olive Oil Cake', time: '60m', ingredients: 9, emoji: '🍋', class: 'rcImg3' }
    ];

    const collections = [
        { id: 1, name: 'Dinner Mains', count: 18, emoji: '🍝', color: 'ccRust', icons: ['🍖', '🥩', '🐟'] },
        { id: 2, name: 'Healthy Salads', count: 7, emoji: '🥗', color: 'ccSage', icons: ['🥬', '🍅', '🥕'] },
        { id: 3, name: 'Baked Goods', count: 11, emoji: '🍰', color: 'ccAmber', icons: ['🧁', '🍞', '🥐'] }
    ];

    const stats = [
        { id: 1, icon: '📖', iconBg: '#FDE8D0', value: '42', label: 'Total Recipes' },
        { id: 2, icon: '📂', iconBg: '#D5EBD6', value: '8', label: 'Collections' },
        { id: 3, icon: '✨', iconBg: '#FDF1D0', value: '3', label: 'Added This Week' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleRecipeClick = (recipeId) => {
        navigate(`/recipe/${recipeId}`);
    };

    const handleCollectionClick = (collectionId) => {
        navigate(`/collections/${collectionId}`);
    };

    const handleAddRecipe = () => {
        navigate('/create-recipe');
    };

    const handleCreateCollection = () => {
        navigate('/collections/new');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Get user's first name or display name
    const displayName = user?.firstName || user?.name || 'Chef';

    return (
        <div className={styles.dashboard}>
            {/* Navigation
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>🍳</div>
                    <span className={styles.logoText}>RecipeNest</span>
                </div>
                <div className={styles.dashNav}>
                    <form className={styles.searchBar} onSubmit={handleSearch}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search recipes…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </form>
                    <div className={styles.avatar}>
                        {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                        {user?.lastName?.[0] || ''}
                    </div>
                </div>
            </nav> */}

            <div className={styles.dashContent}>
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

                <div className={styles.statsRow}>
                    {stats.map(stat => (
                        <div key={stat.id} className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: stat.iconBg }}>
                                {stat.icon}
                            </div>
                            <div className={styles.statNum}>{stat.value}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.quickActions}>
                    <button className={styles.btnPrimary} onClick={handleAddRecipe}>
                        + Add New Recipe
                    </button>
                    <button className={styles.btnOutline} onClick={handleCreateCollection}>
                        📁 Create Collection
                    </button>
                </div>

                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Recently Added</h3>
                    <span className={styles.viewAll} onClick={() => navigate('/recipes')}>
                        View All →
                    </span>
                </div>

                <div className={styles.recipeGrid}>
                    {recentRecipes.map(recipe => (
                        <div 
                            key={recipe.id} 
                            className={styles.recipeCard}
                            onClick={() => handleRecipeClick(recipe.id)}
                        >
                            <div className={`${styles.recipeCardImg} ${styles[recipe.class]}`}>
                                {recipe.emoji}
                            </div>
                            <div className={styles.recipeCardBody}>
                                <div className={styles.recipeCardTitle}>{recipe.title}</div>
                                <div className={styles.recipeCardMeta}>
                                    <span className={styles.metaPill}>⏱ {recipe.time}</span>
                                    <span className={styles.metaPill}>🧅 {recipe.ingredients}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Collections Section */}
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Your Collections</h3>
                    <span className={styles.viewAll} onClick={() => navigate('/collections')}>
                        View All →
                    </span>
                </div>

                <div className={styles.collectionsRow}>
                    {collections.map(collection => (
                        <div 
                            key={collection.id} 
                            className={`${styles.collectionCard} ${styles[collection.color]}`}
                            onClick={() => handleCollectionClick(collection.id)}
                        >
                            <div className={styles.collectionName}>
                                {collection.emoji} {collection.name}
                            </div>
                            <div className={styles.collectionCount}>
                                {collection.count} recipes
                            </div>
                            <div className={styles.collectionIcons}>
                                {collection.icons.map((icon, index) => (
                                    <div key={index} className={styles.collectionIcon}>
                                        {icon}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;