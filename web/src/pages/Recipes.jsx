import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import styles from '../styles/Recipes.module.css';

const Recipes = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterPublic, setFilterPublic] = useState('all');

    const allRecipes = [
        { id: 1, title: 'Moroccan Lamb Tagine', time: '2h 20m', ingredients: 12, emoji: '🥘', bg: 'rc1', isPublic: true, collection: 'Dinner Mains' },
        { id: 2, title: 'Summer Panzanella', time: '20m', ingredients: 8, emoji: '🥗', bg: 'rc2', isPublic: true, collection: 'Healthy Salads' },
        { id: 3, title: 'Lemon Olive Oil Cake', time: '60m', ingredients: 9, emoji: '🍋', bg: 'rc3', isPublic: false, collection: 'Baked Goods' },
        { id: 4, title: 'Classic Carbonara', time: '25m', ingredients: 6, emoji: '🍝', bg: 'rc4', isPublic: true, collection: 'Dinner Mains' },
        { id: 5, title: 'Tonkotsu Ramen', time: '4h', ingredients: 18, emoji: '🍜', bg: 'rc5', isPublic: false, collection: 'Weekend Feasts' },
        { id: 6, title: 'Peach Galette', time: '1h 30m', ingredients: 11, emoji: '🥧', bg: 'rc6', isPublic: true, collection: 'Baked Goods' },
    ];

    const filtered = allRecipes.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterPublic === 'all' || (filterPublic === 'public' ? r.isPublic : !r.isPublic);
        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.pageHeader}>
                    <div className={styles.pageHeaderLeft}>
                        <h2 className={styles.pageTitle}>My Recipes</h2>
                        <span className={styles.recipeCount}>{filtered.length} recipes</span>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => navigate('/create-recipe')}>
                        + New Recipe
                    </button>
                </div>

                <div className={styles.filterBar}>
                    <input
                        className={styles.searchInput}
                        placeholder="🔍 Search recipes…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className={styles.sortSelect}
                        value={filterPublic}
                        onChange={e => setFilterPublic(e.target.value)}
                    >
                        <option value="all">All Recipes</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <select
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="newest">Sort: Newest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="name">Sort: Name A–Z</option>
                    </select>
                </div>

                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyEmoji}>🍳</div>
                        <h3 className={styles.emptyTitle}>No recipes found</h3>
                        <p className={styles.emptyText}>Try a different search or add a new recipe.</p>
                        <button className={styles.btnPrimary} onClick={() => navigate('/create-recipe')}>
                            + Add New Recipe
                        </button>
                    </div>
                ) : (
                    <div className={styles.recipeGrid}>
                        {filtered.map(recipe => (
                            <div
                                key={recipe.id}
                                className={styles.recipeCard}
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                            >
                                <div className={`${styles.recipeCardImg} ${styles[recipe.bg]}`}>
                                    {recipe.emoji}
                                </div>
                                <div className={styles.recipeCardBody}>
                                    <div className={styles.recipeCardTop}>
                                        <div className={styles.recipeCardTitle}>{recipe.title}</div>
                                        {recipe.isPublic
                                            ? <span className={styles.tagPublic}>🌐 Public</span>
                                            : <span className={styles.tagPrivate}>🔒 Private</span>
                                        }
                                    </div>
                                    <div className={styles.recipeCardMeta}>
                                        <span className={styles.metaPill}>⏱ {recipe.time}</span>
                                        <span className={styles.metaPill}>🧅 {recipe.ingredients}</span>
                                    </div>
                                    <div className={styles.recipeCardFooter}>
                                        <span className={styles.collectionTag}>📂 {recipe.collection}</span>
                                        <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                                                title="Edit"
                                            >✏️</button>
                                            <button className={styles.iconBtn} title="Delete">🗑</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Recipes;