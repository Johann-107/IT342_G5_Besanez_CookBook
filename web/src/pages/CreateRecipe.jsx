import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import styles from '../styles/CreateRecipe.module.css';

const UNITS = ['g', 'kg', 'ml', 'L', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'piece', 'pinch', 'clove', 'slice', 'other'];

const emptyIngredient = () => ({ id: Date.now(), quantity: '', unit: '', name: '', notes: '' });
const emptyStep = () => ({ id: Date.now(), description: '' });

const CreateRecipe = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        description: '',
        prepTime: '',
        cookTime: '',
        totalTime: '',
        imageUrl: '',
        isPublic: false,
        notes: '',
    });

    const [ingredients, setIngredients] = useState([emptyIngredient()]);
    const [steps, setSteps] = useState([emptyStep()]);
    const [selectedCollections, setSelectedCollections] = useState([]);

    const collections = [
        { id: 1, name: '🍝 Dinner Mains' },
        { id: 2, name: '🥗 Healthy Salads' },
        { id: 3, name: '🍰 Baked Goods' },
        { id: 4, name: '🍷 Weekend Feasts' },
        { id: 5, name: '🥣 Quick Breakfasts' },
    ];

    // Ingredients
    const addIngredient = () => setIngredients([...ingredients, emptyIngredient()]);
    const updateIngredient = (id, field, value) =>
        setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
    const removeIngredient = (id) => setIngredients(ingredients.filter(i => i.id !== id));

    // Steps
    const addStep = () => setSteps([...steps, emptyStep()]);
    const updateStep = (id, value) =>
        setSteps(steps.map(s => s.id === id ? { ...s, description: value } : s));
    const removeStep = (id) => setSteps(steps.filter(s => s.id !== id));

    // Collections
    const toggleCollection = (id) =>
        setSelectedCollections(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );

    const handleSubmit = (e, isDraft = false) => {
        e.preventDefault();
        // TODO: wire to API
        navigate('/recipes');
    };

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.pageHeader}>
                    <div className={styles.pageHeaderLeft}>
                        <h2 className={styles.pageTitle}>Create New Recipe</h2>
                    </div>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => navigate('/recipes')}
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.formBody}>

                    {/* Basic Info */}
                    <section className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>📝 Basic Information</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Recipe Title *</label>
                            <input
                                className={`${styles.formInput} ${form.name ? styles.inputActive : ''}`}
                                type="text"
                                placeholder="What's the recipe called?"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Description</label>
                            <textarea
                                className={styles.formTextarea}
                                placeholder="Briefly describe your recipe…"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className={styles.formRow3}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Prep Time (min)</label>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={form.prepTime}
                                    onChange={e => setForm({ ...form, prepTime: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Cook Time (min)</label>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={form.cookTime}
                                    onChange={e => setForm({ ...form, cookTime: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Total Time (min)</label>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={form.totalTime}
                                    onChange={e => setForm({ ...form, totalTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Image URL</label>
                            <input
                                className={styles.formInput}
                                type="url"
                                placeholder="https://…"
                                value={form.imageUrl}
                                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Ingredients */}
                    <section className={styles.formSection}>
                        <div className={styles.sectionTitleRow}>
                            <h3 className={styles.sectionTitle}>🧅 Ingredients</h3>
                            <button type="button" className={styles.btnGhost} onClick={addIngredient}>
                                + Add Ingredient
                            </button>
                        </div>
                        {ingredients.map((ing, index) => (
                            <div key={ing.id} className={styles.ingredientRow}>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    placeholder="Qty"
                                    value={ing.quantity}
                                    onChange={e => updateIngredient(ing.id, 'quantity', e.target.value)}
                                    min="0"
                                    style={{ maxWidth: '80px' }}
                                />
                                <select
                                    className={styles.formSelect}
                                    value={ing.unit}
                                    onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
                                    style={{ maxWidth: '90px' }}
                                >
                                    <option value="">Unit</option>
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="Ingredient name *"
                                    value={ing.name}
                                    onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                                    required
                                />
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="Notes (optional)"
                                    value={ing.notes}
                                    onChange={e => updateIngredient(ing.id, 'notes', e.target.value)}
                                />
                                {ingredients.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => removeIngredient(ing.id)}
                                    >−</button>
                                )}
                            </div>
                        ))}
                    </section>

                    {/* Instructions */}
                    <section className={styles.formSection}>
                        <div className={styles.sectionTitleRow}>
                            <h3 className={styles.sectionTitle}>📋 Instructions</h3>
                            <button type="button" className={styles.btnGhost} onClick={addStep}>
                                + Add Step
                            </button>
                        </div>
                        {steps.map((step, index) => (
                            <div key={step.id} className={styles.stepRow}>
                                <div className={styles.stepNum}>{index + 1}</div>
                                <textarea
                                    className={styles.stepTextarea}
                                    placeholder={`Step ${index + 1}…`}
                                    value={step.description}
                                    onChange={e => updateStep(step.id, e.target.value)}
                                    rows={2}
                                    required
                                />
                                {steps.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => removeStep(step.id)}
                                    >−</button>
                                )}
                            </div>
                        ))}
                    </section>

                    {/* Notes */}
                    <section className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>🗒️ Additional Notes</h3>
                        <textarea
                            className={styles.formTextarea}
                            placeholder="Tips, variations, serving suggestions…"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={4}
                        />
                    </section>

                    {/* Organization */}
                    <section className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>📂 Organization</h3>
                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={form.isPublic}
                                onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                            />
                            <span>Make this recipe public</span>
                        </label>
                        <div className={styles.formGroup} style={{ marginTop: '14px' }}>
                            <label className={styles.formLabel}>Add to Collections</label>
                            <div className={styles.collectionsList}>
                                {collections.map(col => (
                                    <label key={col.id} className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCollections.includes(col.id)}
                                            onChange={() => toggleCollection(col.id)}
                                        />
                                        <span>{col.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Sticky Save Bar */}
                    <div className={styles.stickyBar}>
                        <button type="button" className={styles.btnGhost} onClick={e => handleSubmit(e, true)}>
                            Save as Draft
                        </button>
                        <button type="button" className={styles.btnOutline} onClick={() => navigate('/recipes')}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.btnPrimary}>
                            💾 Save Recipe
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateRecipe;