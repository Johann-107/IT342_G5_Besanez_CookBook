import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import collectionAPI from '../services/collection';

// ── Design Patterns ────────────────────────────────────────────────────────────
import RecipeBuilder, { emptyIngredient, emptyStep } from '../patterns/RecipeBuilder';
import { ImageUploadContext, IMAGE_STRATEGIES } from '../patterns/ImageUploadStrategy';
import CookbookFacade from '../patterns/CookbookFacade';

import styles from '../styles/CreateRecipe.module.css';

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

const CreateRecipe = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const fileInputRef = useRef(null);

    // ── State seeded by Builder ─────────────────────────────────────────────────
    const [form, setForm] = useState(RecipeBuilder.blank().build().form);
    const [ingredients, setIngredients] = useState([emptyIngredient()]);
    const [steps, setSteps] = useState([emptyStep()]);

    // ── Strategy: image upload ─────────────────────────────────────────────────
    // ImageUploadContext holds whichever strategy is active
    const imageContext = useRef(new ImageUploadContext(IMAGE_STRATEGIES.file));
    const [imageMode, setImageMode] = useState('file');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [urlInput, setUrlInput] = useState('');
    const [dragOver, setDragOver] = useState(false);

    // ── Other state ───────────────────────────────────────────────────────────
    const [collections, setCollections] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // ── Load existing recipe using Facade (edit mode) ─────────────────────────
    useEffect(() => {
        if (!isEditing) return;
        const loadRecipe = async () => {
            try {
                // Facade + Builder: one call returns a pre-populated builder
                const { builder } = await CookbookFacade.getRecipeForEdit(id);
                const { form: loadedForm, ingredients: loadedIng, steps: loadedSteps } = builder.build();
                setForm(loadedForm);
                setIngredients(loadedIng);
                setSteps(loadedSteps);
                if (loadedForm.imageUrl) {
                    setImagePreview(loadedForm.imageUrl);
                    setUrlInput(loadedForm.imageUrl);
                }
            } catch {
                setError('Failed to load recipe for editing.');
            }
        };
        loadRecipe();
    }, [id, isEditing]);

    // ── Load collections ──────────────────────────────────────────────────────
    useEffect(() => {
        collectionAPI.getCollections({ size: 100 })
            .then(res => setCollections(res.data.content || []))
            .catch(() => { });
    }, []);

    // ── Strategy: switch mode ─────────────────────────────────────────────────
    const switchImageMode = (mode) => {
        imageContext.current.setStrategy(IMAGE_STRATEGIES[mode]);
        setImageMode(mode);
    };

    // ── Strategy: handle file input ───────────────────────────────────────────
    const handleFileChange = useCallback((file) => {
        if (!file) return;
        const validationError = imageContext.current.validate(file);
        if (validationError) { setError(validationError); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError('');
    }, []);

    const handleFileInputChange = (e) => {
        handleFileChange(e.target.files?.[0]);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileChange(e.dataTransfer.files?.[0]);
    };

    // ── Strategy: apply URL ────────────────────────────────────────────────────
    const handleUrlApply = () => {
        const validationError = imageContext.current.validate(urlInput.trim());
        if (validationError) { setError(validationError); return; }
        setImagePreview(urlInput.trim());
        setForm(f => ({ ...f, imageUrl: urlInput.trim() }));
        setImageFile(null);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setUrlInput('');
        setForm(f => ({ ...f, imageUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Ingredient helpers ─────────────────────────────────────────────────────
    const addIngredient = () => setIngredients(prev => [...prev, emptyIngredient()]);
    const updateIngredient = (key, field, value) =>
        setIngredients(prev => prev.map(i => i._key === key ? { ...i, [field]: value } : i));
    const removeIngredient = (key) =>
        setIngredients(prev => prev.filter(i => i._key !== key));

    // ── Step helpers ───────────────────────────────────────────────────────────
    const addStep = () => setSteps(prev => [...prev, emptyStep()]);
    const updateStep = (key, value) =>
        setSteps(prev => prev.map(s => s._key === key ? { ...s, description: value } : s));
    const removeStep = (key) =>
        setSteps(prev => prev.filter(s => s._key !== key));

    const toggleCollection = (colId) =>
        setSelectedCollections(prev =>
            prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
        );

    // ── Submit: uses Builder for payload + Strategy for image + Facade for save ─
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            // Strategy resolves the image to a URL or base64 string
            const resolvedImageUrl = await imageContext.current.resolve({
                file: imageFile,
                url: urlInput,
            });

            // Builder builds the clean request payload
            const recipePayload = RecipeBuilder.toRequestPayload(form, resolvedImageUrl);

            const validIngredients = ingredients
                .filter(i => i.name.trim())
                .map(ing => ({
                    name: ing.name.trim(),
                    quantity: ing.quantity ? Number(ing.quantity) : 0,
                    unit: ing.unit || null,
                    notes: ing.notes || null,
                }));

            const validSteps = steps.filter(s => s.description.trim());

            let recipeId;

            if (isEditing) {
                // Facade: update recipe + its sub-resources
                await CookbookFacade.updateRecipeWithDetails(
                    id, recipePayload,
                    ingredients.filter(i => i.name.trim()),
                    steps.filter(s => s.description.trim())
                );
                recipeId = id;
            } else {
                // Facade: create recipe + sub-resources + collection memberships
                const result = await CookbookFacade.createRecipeWithDetails(
                    recipePayload,
                    validIngredients,
                    validSteps,
                    selectedCollections
                );
                recipeId = result.recipeId;
            }

            navigate(`/recipe/${recipeId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save recipe. Please try again.');
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
                                <input className={styles.formInput} type="number" min="0" placeholder="0"
                                    value={form.prepTimeMinutes} onChange={e => setForm({ ...form, prepTimeMinutes: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Cook Time (min)</label>
                                <input className={styles.formInput} type="number" min="0" placeholder="0"
                                    value={form.cookTimeMinutes} onChange={e => setForm({ ...form, cookTimeMinutes: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Total Time (min)</label>
                                <input className={styles.formInput} type="number" min="0" placeholder="0"
                                    value={form.totalTimeMinutes} onChange={e => setForm({ ...form, totalTimeMinutes: e.target.value })} />
                            </div>
                        </div>

                        {/* ── Image Upload — Strategy pattern drives mode switching ── */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Recipe Photo</label>

                            <div className={styles.imageModeTabs}>
                                {Object.entries(IMAGE_STRATEGIES).map(([key, strategy]) => (
                                    <button key={key} type="button"
                                        className={`${styles.imageModeTab} ${imageMode === key ? styles.imageModeTabActive : ''}`}
                                        onClick={() => switchImageMode(key)}
                                    >
                                        {strategy.icon} {strategy.label}
                                    </button>
                                ))}
                            </div>

                            {imageMode === 'file' ? (
                                <>
                                    <input ref={fileInputRef} type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className={styles.hiddenFileInput}
                                        onChange={handleFileInputChange} />
                                    {imagePreview ? (
                                        <div className={styles.imagePreviewWrap}>
                                            <img src={imagePreview} alt="Recipe preview" className={styles.imagePreview}
                                                onError={() => setImagePreview(null)} />
                                            <div className={styles.imagePreviewOverlay}>
                                                <button type="button" className={styles.imagePreviewChange}
                                                    onClick={() => fileInputRef.current?.click()}>📷 Change Photo</button>
                                                <button type="button" className={styles.imagePreviewRemove}
                                                    onClick={handleRemoveImage}>🗑 Remove</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={handleDrop}
                                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                        >
                                            <div className={styles.dropZoneIcon}>🖼️</div>
                                            <div className={styles.dropZoneText}>
                                                <span className={styles.dropZonePrimary}>
                                                    Drop an image here or{' '}
                                                    <span className={styles.dropZoneLink}>browse files</span>
                                                </span>
                                                <span className={styles.dropZoneHint}>JPEG, PNG, GIF, WEBP · max 5 MB</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.urlInputRow}>
                                    <input className={styles.formInput} type="url"
                                        placeholder="https://example.com/photo.jpg"
                                        value={urlInput}
                                        onChange={e => setUrlInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlApply())} />
                                    <button type="button" className={styles.urlApplyBtn}
                                        onClick={handleUrlApply} disabled={!urlInput.trim()}>Preview</button>
                                </div>
                            )}

                            {imageMode === 'url' && imagePreview && (
                                <div className={styles.imagePreviewWrap} style={{ marginTop: '10px' }}>
                                    <img src={imagePreview} alt="Recipe preview" className={styles.imagePreview}
                                        onError={() => setImagePreview(null)} />
                                    <div className={styles.imagePreviewOverlay}>
                                        <button type="button" className={styles.imagePreviewRemove}
                                            onClick={handleRemoveImage}>🗑 Remove</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Ingredients */}
                    <section className={styles.formSection}>
                        <div className={styles.sectionTitleRow}>
                            <h3 className={styles.sectionTitle}>🧅 Ingredients</h3>
                            <button type="button" className={styles.btnGhost} onClick={addIngredient}>+ Add Ingredient</button>
                        </div>
                        {ingredients.map(ing => (
                            <div key={ing._key} className={styles.ingredientRow}>
                                <input className={styles.formInput} type="number" placeholder="Qty"
                                    value={ing.quantity} min="0" style={{ maxWidth: '80px' }}
                                    onChange={e => updateIngredient(ing._key, 'quantity', e.target.value)} />
                                <select className={styles.formSelect} value={ing.unit} style={{ maxWidth: '90px' }}
                                    onChange={e => updateIngredient(ing._key, 'unit', e.target.value)}>
                                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                </select>
                                <input className={styles.formInput} type="text" placeholder="Ingredient name *"
                                    value={ing.name} onChange={e => updateIngredient(ing._key, 'name', e.target.value)} />
                                <input className={styles.formInput} type="text" placeholder="Notes (optional)"
                                    value={ing.notes} onChange={e => updateIngredient(ing._key, 'notes', e.target.value)} />
                                {ingredients.length > 1 && (
                                    <button type="button" className={styles.removeBtn}
                                        onClick={() => removeIngredient(ing._key)}>−</button>
                                )}
                            </div>
                        ))}
                    </section>

                    {/* Instructions */}
                    <section className={styles.formSection}>
                        <div className={styles.sectionTitleRow}>
                            <h3 className={styles.sectionTitle}>📋 Instructions</h3>
                            <button type="button" className={styles.btnGhost} onClick={addStep}>+ Add Step</button>
                        </div>
                        {steps.map((step, index) => (
                            <div key={step._key} className={styles.stepRow}>
                                <div className={styles.stepNum}>{index + 1}</div>
                                <textarea className={styles.stepTextarea} placeholder={`Step ${index + 1}…`}
                                    value={step.description} rows={2}
                                    onChange={e => updateStep(step._key, e.target.value)} />
                                {steps.length > 1 && (
                                    <button type="button" className={styles.removeBtn}
                                        onClick={() => removeStep(step._key)}>−</button>
                                )}
                            </div>
                        ))}
                    </section>

                    {/* Notes */}
                    <section className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>🗒️ Additional Notes</h3>
                        <textarea className={styles.formTextarea} rows={4}
                            placeholder="Tips, variations, serving suggestions…"
                            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </section>

                    {/* Organization */}
                    <section className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>📂 Organization</h3>
                        <label className={styles.checkboxRow}>
                            <input type="checkbox" checked={form.isPublic}
                                onChange={e => setForm({ ...form, isPublic: e.target.checked })} />
                            <span>Make this recipe public</span>
                        </label>
                        {!isEditing && collections.length > 0 && (
                            <div className={styles.formGroup} style={{ marginTop: '14px' }}>
                                <label className={styles.formLabel}>Add to Collections</label>
                                <div className={styles.collectionsList}>
                                    {collections.map(col => (
                                        <label key={col.id} className={styles.checkboxRow}>
                                            <input type="checkbox" checked={selectedCollections.includes(col.id)}
                                                onChange={() => toggleCollection(col.id)} />
                                            <span>📂 {col.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Sticky Save Bar */}
                    <div className={styles.stickyBar}>
                        <button type="button" className={styles.btnOutline}
                            onClick={() => navigate(isEditing ? `/recipe/${id}` : '/recipes')}>Cancel</button>
                        <button type="submit" className={styles.btnPrimary} disabled={saving}>
                            {saving ? 'Saving…' : `💾 ${isEditing ? 'Update Recipe' : 'Save Recipe'}`}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateRecipe;