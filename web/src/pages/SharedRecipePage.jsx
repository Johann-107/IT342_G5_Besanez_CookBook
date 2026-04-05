import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import shareAPI from '../services/share';
import ingredientAPI from '../services/ingredient';
import instructionAPI from '../services/instruction';
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
    const [savedRecipe, setSavedRecipe] = useState(null); // holds result after saving

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const recipeRes = await shareAPI.getSharedRecipe(token);
                const r = recipeRes.data;
                setRecipe(r);

                // Load ingredients + instructions using the recipe id
                // These endpoints are authenticated, so only fetch if user is logged in
                if (user) {
                    const [ingRes, instRes] = await Promise.all([
                        ingredientAPI.getIngredients(r.id).catch(() => ({ data: [] })),
                        instructionAPI.getInstructions(r.id).catch(() => ({ data: [] })),
                    ]);
                    setIngredients(ingRes.data || []);
                    setInstructions(instRes.data || []);
                }
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
    }, [token, user]);

    const formatTime = (minutes) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes} min`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
    };

    const isOwnRecipe = user && recipe && user.userId === recipe.userId;

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

    return (
        <div className={styles.pageWrap}>
            {/* Top bar */}
            <nav className={styles.topBar}>
                <Link to={user ? '/dashboard' : '/'} className={styles.brand}>
                    <div className={styles.brandIcon}>🍳</div>
                    <span className={styles.brandText}>CookBook</span>
                </Link>

                <div className={styles.topBarRight}>
                    {/* Saved confirmation */}
                    {savedRecipe && (
                        <span className={styles.savedBadge}>
                            ✓ Saved to your cookbook!
                        </span>
                    )}

                    {/* Save button — only for authenticated users who don't own this recipe */}
                    {user && !isOwnRecipe && !savedRecipe && (
                        <button
                            className={styles.saveBtn}
                            onClick={() => setShowSaveModal(true)}
                        >
                            📥 Save Recipe
                        </button>
                    )}

                    {/* Prompt unauthenticated users to log in */}
                    {!user && (
                        <Link to="/" className={styles.loginPromptBtn}>
                            Sign in to Save
                        </Link>
                    )}

                    {/* Already-owner indicator */}
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

            {/* Recipe hero */}
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

            {/* Body */}
            {user ? (
                /* Full detail for logged-in users */
                <div className={styles.body}>
                    <div className={styles.left}>
                        {ingredients.length > 0 && (
                            <div className={styles.detailCard}>
                                <h4 className={styles.cardTitle}>
                                    Ingredients
                                    <span className={styles.countBadge}>{ingredients.length}</span>
                                </h4>
                                <ul className={styles.ingredientList}>
                                    {ingredients.map(ing => (
                                        <li key={ing.id} className={styles.ingredientItem}>
                                            <strong>
                                                {ing.quantity}{ing.unit ? ` ${ing.unit.toLowerCase()}` : ''}
                                            </strong>{' '}{ing.name}
                                            {ing.notes && (
                                                <span className={styles.ingNotes}> — {ing.notes}</span>
                                            )}
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
                    </div>

                    <div className={styles.right}>
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
            ) : (
                /* Teaser for guests */
                <div className={styles.guestTeaser}>
                    <div className={styles.teaserCard}>
                        <div className={styles.teaserEmoji}>🔒</div>
                        <h3 className={styles.teaserTitle}>Sign in to see the full recipe</h3>
                        <p className={styles.teaserDesc}>
                            Create a free CookBook account to view ingredients, instructions,
                            and save this recipe to your personal cookbook.
                        </p>
                        <Link to="/" className={styles.teaserBtn}>
                            Sign In / Create Account
                        </Link>
                    </div>
                </div>
            )}

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

export default SharedRecipePage;