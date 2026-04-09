import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CookbookFacade from '../patterns/CookbookFacade';
import { withErrorBoundary } from '../patterns/ComponentDecorators';
import SaveRecipeModal from '../components/SaveRecipeModal';
import styles from '../styles/SharedRecipePage.module.css';

const SharedRecipePage = () => {
    const { token } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [savedRecipe, setSavedRecipe] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                // Facade + Factory: one call using publicClient — no auth token needed.
                // All three resources are always fetched so the blur overlay for guests
                // has real data to render beneath it.
                const detail = await CookbookFacade.getSharedRecipeDetail(token);
                setRecipe(detail.recipe);
                setIngredients(detail.ingredients);
                setInstructions(detail.instructions);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'This recipe link is invalid or has expired.'
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token]);

    const formatTime = (minutes) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes} min`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
    };

    const isOwnRecipe = user && recipe && user.userId === recipe.userId;

    // ─── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className={styles.pageWrap}>
                <div className={styles.loadingState}>
                    <div className={styles.loadingEmoji}>🍳</div>
                    <p>Loading shared recipe…</p>
                </div>
            </div>
        );
    }

    // ─── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className={styles.pageWrap}>
                <div className={styles.errorState}>
                    <div className={styles.errorEmoji}>🔗</div>
                    <h2 className={styles.errorTitle}>Link unavailable</h2>
                    <p className={styles.errorDesc}>{error}</p>
                    <Link to="/" className={styles.homeLink}>← Back to CookBook</Link>
                </div>
            </div>
        );
    }

    // ─── Main render ───────────────────────────────────────────────────────────
    return (
        <div className={styles.pageWrap}>

            {/* Top bar */}
            <nav className={styles.topBar}>
                <Link to={user ? '/dashboard' : '/'} className={styles.brand}>
                    <div className={styles.brandIcon}>🍳</div>
                    <span className={styles.brandText}>CookBook</span>
                </Link>

                <div className={styles.topBarRight}>
                    {savedRecipe && (
                        <span className={styles.savedBadge}>✓ Saved to your cookbook!</span>
                    )}

                    {user && !isOwnRecipe && !savedRecipe && (
                        <button className={styles.saveBtn} onClick={() => setShowSaveModal(true)}>
                            📥 Save Recipe
                        </button>
                    )}

                    {!user && (
                        <Link to="/" className={styles.loginPromptBtn}>
                            Sign in to Save
                        </Link>
                    )}

                    {isOwnRecipe && (
                        <button
                            className={styles.viewOwnBtn}
                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                            View in My Cookbook →
                        </button>
                    )}
                </div>
            </nav>

            {/* Shared-by banner */}
            <div className={styles.sharedBanner}>
                <span className={styles.sharedBannerIcon}>🔗</span>
                <span>You're viewing a shared recipe</span>
            </div>

            {/* Hero */}
            <div className={styles.hero}>
                <h1 className={styles.recipeTitle}>{recipe.name}</h1>
                {recipe.description && (
                    <p className={styles.recipeDesc}>{recipe.description}</p>
                )}
                <div className={styles.timeBadges}>
                    {recipe.prepTimeMinutes && (
                        <div className={styles.timeBadge}>
                            ⏱ Prep <span>{formatTime(recipe.prepTimeMinutes)}</span>
                        </div>
                    )}
                    {recipe.cookTimeMinutes && (
                        <div className={styles.timeBadge}>
                            🔥 Cook <span>{formatTime(recipe.cookTimeMinutes)}</span>
                        </div>
                    )}
                    {recipe.totalTimeMinutes && (
                        <div className={styles.timeBadge}>
                            ⏰ Total <span>{formatTime(recipe.totalTimeMinutes)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Body — always rendered; guest content is blurred via CSS */}
            <div className={styles.body}>
                <div className={styles.left}>
                    {ingredients.length > 0 && (
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>
                                Ingredients
                                <span className={styles.countBadge}>{ingredients.length}</span>
                            </h4>
                            {/* Blur wrapper for guests */}
                            <div className={!user ? styles.blurredContent : undefined}>
                                <ul className={styles.ingredientList}>
                                    {ingredients.map((ing) => (
                                        <li key={ing.id} className={styles.ingredientItem}>
                                            <strong>
                                                {ing.quantity}{ing.unit ? ` ${ing.unit.toLowerCase()}` : ''}
                                            </strong>{' '}
                                            {ing.name}
                                            {ing.notes && (
                                                <span className={styles.ingNotes}> — {ing.notes}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {!user && <GuestOverlay />}
                        </div>
                    )}

                    {recipe.notes && (
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>Notes</h4>
                            <div className={!user ? styles.blurredContent : undefined}>
                                <p className={styles.notesText}>{recipe.notes}</p>
                            </div>
                            {!user && <GuestOverlay />}
                        </div>
                    )}
                </div>

                <div className={styles.right}>
                    {instructions.length > 0 && (
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>Instructions</h4>
                            <div className={!user ? styles.blurredContent : undefined}>
                                <ol className={styles.stepsList}>
                                    {instructions.map((step) => (
                                        <li key={step.id} className={styles.stepItem}>
                                            <div className={styles.stepNum}>{step.stepNumber}</div>
                                            <p className={styles.stepText}>{step.description}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            {!user && <GuestOverlay />}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating save CTA for mobile */}
            {user && !isOwnRecipe && !savedRecipe && (
                <div className={styles.floatingSave}>
                    <button
                        className={styles.floatingSaveBtn}
                        onClick={() => setShowSaveModal(true)}
                    >
                        📥 Save Recipe to My Cookbook
                    </button>
                </div>
            )}

            {/* Save modal */}
            {showSaveModal && (
                <SaveRecipeModal
                    token={token}
                    recipe={recipe}
                    onClose={() => setShowSaveModal(false)}
                    onSaved={(saved) => {
                        setSavedRecipe(saved);
                        setShowSaveModal(false);
                    }}
                />
            )}
        </div>
    );
};

// ─── Guest blur overlay ────────────────────────────────────────────────────────
// Shown on top of blurred content sections when the user is not logged in.

const GuestOverlay = () => (
    <div style={guestOverlayStyles.wrap}>
        <div style={guestOverlayStyles.card}>
            <div style={guestOverlayStyles.lock}>🔒</div>
            <p style={guestOverlayStyles.text}>
                <Link to="/" style={guestOverlayStyles.link}>Sign in</Link>
                {' '}to see the full recipe
            </p>
        </div>
    </div>
);

const guestOverlayStyles = {
    wrap: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '14px',
        background: 'rgba(253, 248, 242, 0.6)',
        backdropFilter: 'blur(2px)',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '16px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(92, 61, 46, 0.12)',
        border: '1px solid #EDD8C4',
    },
    lock: { fontSize: '1.5rem', marginBottom: '8px' },
    text: { fontSize: '0.875rem', color: '#7A5C46', margin: 0 },
    link: { color: '#C97D4E', fontWeight: 600, textDecoration: 'none' },
};

export default withErrorBoundary(SharedRecipePage);