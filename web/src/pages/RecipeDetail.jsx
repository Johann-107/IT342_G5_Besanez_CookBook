import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import styles from '../styles/RecipeDetail.module.css';

const RecipeDetail = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('ingredients');

    // Sample data
    const recipe = {
        id: 1,
        title: 'Moroccan Lamb Tagine with Preserved Lemons',
        prepTime: 20,
        cookTime: 120,
        totalTime: 140,
        isPublic: true,
        createdAt: 'Feb 14, 2025',
        updatedAt: 'Feb 20, 2025',
        collections: ['Dinner Mains', 'World Cuisine'],
        notes: "Marinate lamb overnight for best results. The preserved lemon rind is essential — don't substitute. Serve with couscous and fresh cilantro. 🌿",
        ingredients: [
            { amount: '800g', name: 'lamb shoulder, diced' },
            { amount: '2', name: 'preserved lemons, quartered' },
            { amount: '1 cup', name: 'Kalamata olives' },
            { amount: '2 tbsp', name: 'ras el hanout spice blend' },
            { amount: '400ml', name: 'chicken stock' },
            { amount: '2', name: 'medium onions, sliced' },
            { amount: '4 cloves', name: 'garlic, minced' },
            { amount: '3 tbsp', name: 'olive oil' },
        ],
        instructions: [
            'Heat olive oil in a heavy tagine or Dutch oven over medium-high heat. Season lamb and brown in batches until golden. Remove and set aside.',
            'In the same pot, sauté onions until soft (5–7 min). Add garlic and ras el hanout, stir for 1 minute until fragrant.',
            'Return lamb to the pot. Add preserved lemons, olives, and stock. Bring to a boil, then reduce heat, cover, and simmer on low for 1.5–2 hours.',
            'Taste and adjust seasoning. Garnish with fresh cilantro and serve immediately over fluffy couscous.',
        ],
    };

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.heroBar}>
                    <button className={styles.backBtn} onClick={() => navigate('/recipes')}>
                        ← My Recipes
                    </button>
                    <div className={styles.titleRow}>
                        <h1 className={styles.recipeTitle}>{recipe.title}</h1>
                        <div className={styles.recipeActions}>
                            <button className={styles.btnGhost} onClick={() => navigate(`/recipe/${id}/edit`)}>
                                ✏️ Edit
                            </button>
                            <button className={styles.btnGhost}>
                                🖨 Print
                            </button>
                            <button className={styles.btnPrimary}>
                                + Collection
                            </button>
                        </div>
                    </div>
                    <div className={styles.timeBadges}>
                        <div className={styles.timeBadge}>⏱ Prep <span>{recipe.prepTime} min</span></div>
                        <div className={styles.timeBadge}>🔥 Cook <span>{recipe.cookTime} min</span></div>
                        <div className={styles.timeBadge}>⏰ Total <span>{Math.floor(recipe.totalTime / 60)}h {recipe.totalTime % 60}m</span></div>
                        {recipe.isPublic && <div className={styles.timeBadge}>🌐 <span>Public</span></div>}
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.left}>
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>
                                Ingredients
                                <span className={styles.countBadge}>{recipe.ingredients.length}</span>
                            </h4>
                            <ul className={styles.ingredientList}>
                                {recipe.ingredients.map((ing, i) => (
                                    <li key={i} className={styles.ingredientItem}>
                                        <strong>{ing.amount}</strong> {ing.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>Notes</h4>
                            <p className={styles.notesText}>{recipe.notes}</p>
                        </div>
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>Details</h4>
                            <div className={styles.detailMeta}>
                                <span>Created: <strong>{recipe.createdAt}</strong></span>
                                <span>Updated: <strong>{recipe.updatedAt}</strong></span>
                            </div>
                            <div className={styles.tagRow}>
                                {recipe.collections.map((col, i) => (
                                    <span key={i} className={styles.tagCollection}>🍝 {col}</span>
                                ))}
                                {recipe.isPublic && <span className={styles.tagPublic}>🌐 Public</span>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.detailCard}>
                            <h4 className={styles.cardTitle}>Instructions</h4>
                            <ol className={styles.stepsList}>
                                {recipe.instructions.map((step, i) => (
                                    <li key={i} className={styles.stepItem}>
                                        <div className={styles.stepNum}>{i + 1}</div>
                                        <p className={styles.stepText}>{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.btnGhost} onClick={() => navigate(-1)}>← Previous</button>
                    <button className={styles.btnGhost} style={{ marginLeft: 'auto' }}>Next →</button>
                </div>
            </div>
        </>
    );
};

export default RecipeDetail;