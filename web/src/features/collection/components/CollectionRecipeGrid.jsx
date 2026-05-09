import { Eye, X, Globe, Lock, ChefHat } from 'lucide-react';
import styles from '../CollectionDetail.module.css';

const BG_CLASSES = ['rc1', 'rc2', 'rc3', 'rc4', 'rc5', 'rc6'];
const EMOJI_MAP = ['🥘', '🥗', '🍋', '🍝', '🍜', '🥧', '🍲', '🥩', '🍰', '🥞'];

const formatTime = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
};

/**
 * CollectionRecipeGrid
 *
 * Props:
 *   recipes          {object[]}  — list of recipe DTOs
 *   onViewRecipe     {function(recipeId)}
 *   onRemoveRecipe   {function(recipeId)} — confirmation should be handled by the caller
 *   onAddRecipes     {function}  — called from the empty-state CTA
 */
const CollectionRecipeGrid = ({ recipes, onViewRecipe, onRemoveRecipe, onAddRecipes }) => {
    if (recipes.length === 0) {
        return (
            <div className={styles.emptyState}>
                <ChefHat size={64} strokeWidth={1.3} color="var(--text-light, #B09080)" />
                <h3 className={styles.emptyTitle}>No recipes yet</h3>
                <p className={styles.emptyText}>
                    Add recipes to this collection from your recipe library.
                </p>
                <button className={styles.btnPrimary} onClick={onAddRecipes}>
                    Browse My Recipes
                </button>
            </div>
        );
    }

    return (
        <div className={styles.recipeGrid}>
            {recipes.map((recipe, index) => (
                <div
                    key={recipe.id}
                    className={styles.recipeCard}
                    onClick={() => onViewRecipe(recipe.id)}
                >
                    <div className={`${styles.recipeCardImg} ${styles[BG_CLASSES[index % BG_CLASSES.length]]}`}>
                        {recipe.imageUrl
                            ? <img src={recipe.imageUrl} alt={recipe.name} className={styles.recipeImg} />
                            : EMOJI_MAP[index % EMOJI_MAP.length]
                        }
                    </div>
                    <div className={styles.recipeCardBody}>
                        <div className={styles.recipeCardTop}>
                            <div className={styles.recipeCardTitle}>{recipe.name}</div>
                            {recipe.isPublic
                                ? <Globe size={14} strokeWidth={2} className={styles.tagPublic} />
                                : <Lock size={14} strokeWidth={2} className={styles.tagPrivate} />
                            }
                        </div>
                        {recipe.description && (
                            <p className={styles.recipeCardDesc}>
                                {recipe.description.slice(0, 60)}
                                {recipe.description.length > 60 ? '…' : ''}
                            </p>
                        )}
                        <div className={styles.recipeCardFooter}>
                            <div className={styles.recipeCardMeta}>
                                {recipe.totalTimeMinutes && (
                                    <span className={styles.metaPill}>
                                        ⏱ {formatTime(recipe.totalTimeMinutes)}
                                    </span>
                                )}
                            </div>
                            <div
                                className={styles.cardActions}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className={styles.iconBtn}
                                    title="View Recipe"
                                    onClick={() => onViewRecipe(recipe.id)}
                                >
                                    <Eye size={13} strokeWidth={2} />
                                </button>
                                <button
                                    className={styles.iconBtnDanger}
                                    title="Remove from collection"
                                    onClick={() => onRemoveRecipe(recipe.id)}
                                >
                                    <X size={13} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CollectionRecipeGrid;