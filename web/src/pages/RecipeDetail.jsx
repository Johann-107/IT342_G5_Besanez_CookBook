import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import SharePanel from '../components/SharePanel';
import CookbookFacade from '../patterns/CookbookFacade';
import { withErrorBoundary } from '../patterns/ComponentDecorators';
import styles from '../styles/RecipeDetail.module.css';

const RecipeDetail = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            setError('');
            try {
                // Facade: one call instead of three scattered Promise.all
                const detail = await CookbookFacade.getRecipeDetail(id);
                setRecipe(detail.recipe);
                setIngredients(detail.ingredients);
                setInstructions(detail.instructions);
            } catch (err) {
                setError('Failed to load recipe. It may not exist or you may not have access.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
        try {
            await CookbookFacade.deleteRecipe(id);
            navigate('/recipes');
        } catch {
            alert('Failed to delete recipe.');
        }
    };

    const formatTime = (minutes) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes} min`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <>
                <DefaultHeader user={user} />
                <div className={styles.loadingState}>
                    <div className={styles.loadingEmoji}>🍳</div>
                    <p>Loading recipe…</p>
                </div>
            </>
        );
    }

    if (error || !recipe) {
        return (
            <>
                <DefaultHeader user={user} />
                <div className={styles.errorState}>
                    <div className={styles.emptyEmoji}>😕</div>
                    <h3>{error || 'Recipe not found.'}</h3>
                    <button className={styles.btnGhost} onClick={() => navigate('/recipes')}>← Back to Recipes</button>
                </div>
            </>
        );
    }

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.heroBar}>
                    <button className={styles.backBtn} onClick={() => navigate('/recipes')}>← My Recipes</button>
                    <div className={styles.titleRow}>
                        <h1 className={styles.recipeTitle}>{recipe.name}</h1>
                        <div className={styles.recipeActions}>
                            <SharePanel recipeId={id} initialToken={recipe.shareToken} />
                            <button className={styles.btnGhost} onClick={() => navigate(`/recipe/${id}/edit`)}>✏️ Edit</button>
                            <button className={styles.btnGhost} onClick={() => window.print()}>🖨 Print</button>
                            <button className={styles.btnDanger} onClick={handleDelete}>🗑 Delete</button>
                        </div>
                    </div>
                    <div className={styles.timeBadges}>
                        {recipe.prepTimeMinutes && (
                            <div className={styles.timeBadge}>⏱ Prep <span>{formatTime(recipe.prepTimeMinutes)}</span></div>
                        )}
                        {recipe.cookTimeMinutes && (
                            <div className={styles.timeBadge}>🔥 Cook <span>{formatTime(recipe.cookTimeMinutes)}</span></div>
                        )}
                        {recipe.totalTimeMinutes && (
                            <div className={styles.timeBadge}>⏰ Total <span>{formatTime(recipe.totalTimeMinutes)}</span></div>
                        )}
                        <div className={styles.timeBadge}>
                            {recipe.isPublic ? '🌐' : '🔒'} <span>{recipe.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.left}>
                        {ingredients.length > 0 && (
                            <div className={styles.detailCard}>
                                <h4 className={styles.cardTitle}>
                                    Ingredients <span className={styles.countBadge}>{ingredients.length}</span>
                                </h4>
                                <ul className={styles.ingredientList}>
                                    {ingredients.map(ing => (
                                        <li key={ing.id} className={styles.ingredientItem}>
                                            <strong>{ing.quantity}{ing.unit ? ` ${ing.unit.toLowerCase()}` : ''}</strong>{' '}{ing.name}
                                            {ing.notes && <span className={styles.ingNotes}> — {ing.notes}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {recipe.notes && (
                            <div className={styles.detailCard}>
                                <h4 className={styles.cardTitle}>Notes</h4>
                                <p className={styles.notesText}>{recipe.notes}</p>
                            </div>
                        )}
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>Details</h4>
                            <div className={styles.detailMeta}>
                                {recipe.createdAt && <span>Created: <strong>{formatDate(recipe.createdAt)}</strong></span>}
                                {recipe.updatedAt && <span>Updated: <strong>{formatDate(recipe.updatedAt)}</strong></span>}
                            </div>
                            <div className={styles.tagRow}>
                                <span className={recipe.isPublic ? styles.tagPublic : styles.tagPrivate}>
                                    {recipe.isPublic ? '🌐 Public' : '🔒 Private'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        {recipe.description && (
                            <div className={styles.detailCard}>
                                <h4 className={styles.cardTitle}>About</h4>
                                <p className={styles.notesText}>{recipe.description}</p>
                            </div>
                        )}
                        {instructions.length > 0 && (
                            <div className={styles.detailCard}>
                                <h4 className={styles.cardTitle}>Instructions</h4>
                                <ol className={styles.stepsList}>
                                    {instructions.map(step => (
                                        <li key={step.id} className={styles.stepItem}>
                                            <div className={styles.stepNum}>{step.stepNumber}</div>
                                            <p className={styles.stepText}>{step.description}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.btnGhost} onClick={() => navigate(-1)}>← Back</button>
                </div>
            </div>
        </>
    );
};

// Decorator: wrap with error boundary so render errors don't crash the app
export default withErrorBoundary(RecipeDetail);