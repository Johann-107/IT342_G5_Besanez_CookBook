import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import recipeAPI from '../services/recipe';
import ingredientAPI from '../services/ingredient';
import instructionAPI from '../services/instruction';
import collectionAPI from '../services/collection';
import styles from '../styles/CreateRecipe.module.css';

// Must match IngredientUnit enum on the backend
const UNITS = [
    { value: '', label: 'Unit' },
    { value: 'G', label: 'g' },
    { value: 'KG', label: 'kg' },
    { value: 'ML', label: 'ml' },
    { value: 'L', label: 'L' },
    { value: 'TSP', label: 'tsp' },
    { value: 'TBSP', label: 'tbsp' },
    { value: 'CUP', label: 'cup' },
    { value: 'FL_OZ', label: 'fl oz' },
    { value: 'OZ', label: 'oz' },
    { value: 'LB', label: 'lb' },
    { value: 'PIECE', label: 'piece' },
    { value: 'PINCH', label: 'pinch' },
    { value: 'CLOVE', label: 'clove' },
    { value: 'SLICE', label: 'slice' },
    { value: 'OTHER', label: 'other' },
];

const emptyIngredient = () => ({ _key: Date.now() + Math.random(), name: '', quantity: '', unit: '', notes: '' });
const emptyStep = () => ({ _key: Date.now() + Math.random(), description: '' });

const CreateRecipe = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // present when editing

    const isEditing = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        description: '',
        prepTimeMinutes: '',
        cookTimeMinutes: '',
        totalTimeMinutes: '',
        imageUrl: '',
        isPublic: false,
        notes: '',
    });

    const [ingredients, setIngredients] = useState([emptyIngredient()]);
    const [steps, setSteps] = useState([emptyStep()]);
    const [collections, setCollections] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // ─── Load existing recipe when editing ────────────────────────────────────
    useEffect(() => {
        if (!isEditing) return;

        const loadRecipe = async () => {
            try {
                const [recipeRes, ingRes, instRes] = await Promise.all([
                    recipeAPI.getRecipeById(id),
                    ingredientAPI.getIngredients(id),
                    instructionAPI.getInstructions(id),
                ]);

                const r = recipeRes.data;
                setForm({
                    name: r.name || '',
                    description: r.description || '',
                    prepTimeMinutes: r.prepTimeMinutes || '',
                    cookTimeMinutes: r.cookTimeMinutes || '',
                    totalTimeMinutes: r.totalTimeMinutes || '',
                    imageUrl: r.imageUrl || '',
                    isPublic: r.isPublic || false,
                    notes: r.notes || '',
                });

                setIngredients(
                    ingRes.data.length > 0
                        ? ingRes.data.map(i => ({ ...i, _key: i.id }))
                        : [emptyIngredient()]
                );

                setSteps(
                    instRes.data.length > 0
                        ? instRes.data.map(s => ({ ...s, _key: s.id }))
                        : [emptyStep()]
                );
            } catch {
                setError('Failed to load recipe for editing.');
            }
        };

        loadRecipe();
    }, [id, isEditing]);

    // ─── Load user's collections ──────────────────────────────────────────────
    useEffect(() => {
        const loadCollections = async () => {
            try {
                const res = await collectionAPI.getCollections({ size: 100 });
                setCollections(res.data.content || []);
            } catch {
                // Non-fatal — collections section just stays empty
            }
        };
        loadCollections();
    }, []);

    // ─── Ingredient helpers ───────────────────────────────────────────────────
    const addIngredient = () => setIngredients(prev => [...prev, emptyIngredient()]);
    const updateIngredient = (key, field, value) =>
        setIngredients(prev => prev.map(i => i._key === key ? { ...i, [field]: value } : i));
    const removeIngredient = (key) =>
        setIngredients(prev => prev.filter(i => i._key !== key));

    // ─── Step helpers ─────────────────────────────────────────────────────────
    const addStep = () => setSteps(prev => [...prev, emptyStep()]);
    const updateStep = (key, value) =>
        setSteps(prev => prev.map(s => s._key === key ? { ...s, description: value } : s));
    const removeStep = (key) =>
        setSteps(prev => prev.filter(s => s._key !== key));

    // ─── Collection toggle ────────────────────────────────────────────────────
    const toggleCollection = (colId) =>
        setSelectedCollections(prev =>
            prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
        );

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            // 1. Create or update the recipe
            const recipePayload = {
                ...form,
                prepTimeMinutes: form.prepTimeMinutes ? Number(form.prepTimeMinutes) : null,
                cookTimeMinutes: form.cookTimeMinutes ? Number(form.cookTimeMinutes) : null,
                totalTimeMinutes: form.totalTimeMinutes ? Number(form.totalTimeMinutes) : null,
            };

            let recipeId;
            if (isEditing) {
                await recipeAPI.updateRecipe(id, recipePayload);
                recipeId = id;
            } else {
                const res = await recipeAPI.createRecipe(recipePayload);
                recipeId = res.data.id;
            }

            // 2. Save ingredients (post each one)
            const validIngredients = ingredients.filter(i => i.name.trim());
            if (!isEditing) {
                await Promise.all(
                    validIngredients.map((ing, idx) =>
                        ingredientAPI.addIngredient(recipeId, {
                            name: ing.name.trim(),
                            quantity: ing.quantity ? Number(ing.quantity) : 0,
                            unit: ing.unit || null,
                            notes: ing.notes || null,
                        })
                    )
                );
            } else {
                // On edit — update existing, skip new (simplified: update all by id)
                await Promise.all(
                    validIngredients
                        .filter(i => i.id)
                        .map(ing =>
                            ingredientAPI.updateIngredient(recipeId, ing.id, {
                                name: ing.name.trim(),
                                quantity: ing.quantity ? Number(ing.quantity) : 0,
                                unit: ing.unit || null,
                                notes: ing.notes || null,
                            })
                        )
                );
            }

            // 3. Save instructions
            const validSteps = steps.filter(s => s.description.trim());
            if (!isEditing) {
                await Promise.all(
                    validSteps.map((step, idx) =>
                        instructionAPI.addInstruction(recipeId, {
                            stepNumber: idx + 1,
                            description: step.description.trim(),
                        })
                    )
                );
            } else {
                await Promise.all(
                    validSteps
                        .filter(s => s.id)
                        .map((step, idx) =>
                            instructionAPI.updateInstruction(recipeId, step.id, {
                                stepNumber: step.stepNumber || idx + 1,
                                description: step.description.trim(),
                            })
                        )
                );
            }

            // 4. Add to selected collections (only on create)
            if (!isEditing && selectedCollections.length > 0) {
                await Promise.all(
                    selectedCollections.map(colId =>
                        collectionAPI.addRecipeToCollection(colId, recipeId)
                    )
                );
            }

            navigate(`/recipe/${recipeId}`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save recipe. Please try again.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.pageHeader}>
                    <div className={styles.pageHeaderLeft}>
                        <h2 className={styles.pageTitle}>
                            {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => navigate(isEditing ? `/recipe/${id}` : '/recipes')}
                    >
                        Cancel
                    </button>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

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
                                    value={form.prepTimeMinutes}
                                    onChange={e => setForm({ ...form, prepTimeMinutes: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Cook Time (min)</label>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={form.cookTimeMinutes}
                                    onChange={e => setForm({ ...form, cookTimeMinutes: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Total Time (min)</label>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={form.totalTimeMinutes}
                                    onChange={e => setForm({ ...form, totalTimeMinutes: e.target.value })}
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
                        {ingredients.map((ing) => (
                            <div key={ing._key} className={styles.ingredientRow}>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    placeholder="Qty"
                                    value={ing.quantity}
                                    onChange={e => updateIngredient(ing._key, 'quantity', e.target.value)}
                                    min="0"
                                    style={{ maxWidth: '80px' }}
                                />
                                <select
                                    className={styles.formSelect}
                                    value={ing.unit}
                                    onChange={e => updateIngredient(ing._key, 'unit', e.target.value)}
                                    style={{ maxWidth: '90px' }}
                                >
                                    {UNITS.map(u => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="Ingredient name *"
                                    value={ing.name}
                                    onChange={e => updateIngredient(ing._key, 'name', e.target.value)}
                                />
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="Notes (optional)"
                                    value={ing.notes}
                                    onChange={e => updateIngredient(ing._key, 'notes', e.target.value)}
                                />
                                {ingredients.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => removeIngredient(ing._key)}
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
                            <div key={step._key} className={styles.stepRow}>
                                <div className={styles.stepNum}>{index + 1}</div>
                                <textarea
                                    className={styles.stepTextarea}
                                    placeholder={`Step ${index + 1}…`}
                                    value={step.description}
                                    onChange={e => updateStep(step._key, e.target.value)}
                                    rows={2}
                                />
                                {steps.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => removeStep(step._key)}
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

                        {!isEditing && collections.length > 0 && (
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
                                            <span>📂 {col.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Sticky Save Bar */}
                    <div className={styles.stickyBar}>
                        <button
                            type="button"
                            className={styles.btnOutline}
                            onClick={() => navigate(isEditing ? `/recipe/${id}` : '/recipes')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : `💾 ${isEditing ? 'Update Recipe' : 'Save Recipe'}`}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateRecipe;