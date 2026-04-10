import { useState, useEffect } from 'react';
import recipeAPI from '../services/recipe';
import collectionAPI from '../services/collection';
import styles from '../styles/AddRecipesModal.module.css';

/**
 * AddRecipesModal
 *
 * Props:
 *   collectionId   {number}   — the collection to add recipes to
 *   existingIds    {number[]} — recipe ids already in this collection (to exclude)
 *   onClose        {function}
 *   onSaved        {function(addedCount)}
 */
const AddRecipesModal = ({ collectionId, existingIds = [], onClose, onSaved }) => {
    const [recipes, setRecipes] = useState([]);
    const [selected, setSelected] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await recipeAPI.getRecipes({ size: 200, sort: 'name,asc' });
                const all = res.data.content || [];
                const available = all.filter(r => !existingIds.includes(r.id));
                setRecipes(available);
            } catch {
                setError('Failed to load recipes.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggleRecipe = (id) =>
        setSelected(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );

    const toggleAll = () => {
        const filtered = filteredRecipes.map(r => r.id);
        const allSelected = filtered.every(id => selected.includes(id));
        if (allSelected) {
            setSelected(prev => prev.filter(id => !filtered.includes(id)));
        } else {
            setSelected(prev => [...new Set([...prev, ...filtered])]);
        }
    };

    const handleSave = async () => {
        if (selected.length === 0) return;
        setSaving(true);
        setError('');
        try {
            for (const recipeId of selected) {
                await collectionAPI.addRecipeToCollection(collectionId, recipeId);
            }
            setSuccess(`Added ${selected.length} recipe${selected.length > 1 ? 's' : ''}!`);
            setTimeout(() => {
                onSaved && onSaved(selected.length);
                onClose();
            }, 900);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add recipes to collection.');
        } finally {
            setSaving(false);
        }
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const allFilteredSelected = filteredRecipes.length > 0 &&
        filteredRecipes.every(r => selected.includes(r.id));

    const EMOJI_MAP = ['🥘', '🥗', '🍋', '🍝', '🍜', '🥧', '🍲', '🥩', '🍰', '🥞'];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <div className={styles.modalHeader}>
                    <div className={styles.headerEmoji}>🍳</div>
                    <h2 className={styles.modalTitle}>Add Recipes</h2>
                    <p className={styles.modalSubtitle}>
                        Select recipes to add to this collection
                    </p>
                </div>

                <div className={styles.searchBar}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="🔍 Search recipes…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                    {filteredRecipes.length > 0 && (
                        <button
                            type="button"
                            className={styles.selectAllBtn}
                            onClick={toggleAll}
                        >
                            {allFilteredSelected ? 'Deselect all' : 'Select all'}
                        </button>
                    )}
                </div>

                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMsg}>{error}</div>}
                    {success && <div className={styles.successMsg}>✓ {success}</div>}

                    {loading ? (
                        <div className={styles.loadingState}>Loading your recipes…</div>
                    ) : recipes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyEmoji}>🍳</div>
                            <p className={styles.emptyTitle}>All your recipes are already in this collection</p>
                        </div>
                    ) : filteredRecipes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p className={styles.emptyTitle}>No recipes match "{search}"</p>
                        </div>
                    ) : (
                        <div className={styles.recipeList}>
                            {filteredRecipes.map((recipe, index) => (
                                <label
                                    key={recipe.id}
                                    className={`${styles.recipeItem} ${selected.includes(recipe.id) ? styles.recipeItemSelected : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        className={styles.recipeCheckbox}
                                        checked={selected.includes(recipe.id)}
                                        onChange={() => toggleRecipe(recipe.id)}
                                    />
                                    <div className={styles.recipeThumb}>
                                        {recipe.imageUrl
                                            ? <img src={recipe.imageUrl} alt={recipe.name} className={styles.recipeThumbImg} onError={e => e.target.style.display = 'none'} />
                                            : <span style={{ fontSize: '16px' }}>{EMOJI_MAP[index % EMOJI_MAP.length]}</span>
                                        }
                                    </div>
                                    <div className={styles.recipeInfo}>
                                        <span className={styles.recipeName}>{recipe.name}</span>
                                        {recipe.totalTimeMinutes && (
                                            <span className={styles.recipeMeta}>
                                                ⏱ {recipe.totalTimeMinutes < 60
                                                    ? `${recipe.totalTimeMinutes}m`
                                                    : `${Math.floor(recipe.totalTimeMinutes / 60)}h ${recipe.totalTimeMinutes % 60 ? recipe.totalTimeMinutes % 60 + 'm' : ''}`}
                                            </span>
                                        )}
                                    </div>
                                    <span className={recipe.isPublic ? styles.tagPublic : styles.tagPrivate}>
                                        {recipe.isPublic ? '🌐' : '🔒'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <span className={styles.selectionCount}>
                        {selected.length > 0 ? `${selected.length} selected` : ''}
                    </span>
                    <div className={styles.footerBtns}>
                        <button
                            className={styles.btnOutline}
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleSave}
                            disabled={saving || selected.length === 0}
                        >
                            {saving
                                ? 'Adding…'
                                : selected.length > 0
                                    ? `Add ${selected.length} recipe${selected.length > 1 ? 's' : ''}`
                                    : 'Select recipes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRecipesModal;