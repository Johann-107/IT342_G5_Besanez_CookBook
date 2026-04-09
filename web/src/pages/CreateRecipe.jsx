import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import recipeAPI from '../services/recipe';
import ingredientAPI from '../services/ingredient';
import instructionAPI from '../services/instruction';
import collectionAPI from '../services/collection';
import {
    ImageUploadContext,
    CloudinaryStrategy,
    URLStrategy,
    IMAGE_STRATEGIES,
} from '../patterns/ImageUploadStrategy';
import { withErrorBoundary } from '../patterns/ComponentDecorators';
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

const emptyIngredient = () => ({
    _key: Date.now() + Math.random(), name: '', quantity: '', unit: '', notes: '',
});
const emptyStep = () => ({
    _key: Date.now() + Math.random(), description: '',
});

const CreateRecipe = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);
    const isEditing = Boolean(id);

    // ─── Form state ─────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        name: '', description: '', prepTimeMinutes: '', cookTimeMinutes: '',
        totalTimeMinutes: '', imageUrl: '', isPublic: false, notes: '',
    });

    // ─── Image state ─────────────────────────────────────────────────────────────
    // imageMode: 'cloudinary' | 'url'
    const [imageMode, setImageMode] = useState('cloudinary');
    const [imageFile, setImageFile] = useState(null);   // raw File from input
    const [imagePreview, setImagePreview] = useState(null);   // local object URL for preview
    const [urlInput, setUrlInput] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);  // true while Cloudinary upload runs

    // Strategy context — swapped when imageMode changes
    const imageContext = useMemo(() => new ImageUploadContext(IMAGE_STRATEGIES[imageMode]), []);
    useEffect(() => {
        imageContext.setStrategy(IMAGE_STRATEGIES[imageMode]);
    }, [imageMode, imageContext]);

    // ─── Other form state ────────────────────────────────────────────────────────
    const [ingredients, setIngredients] = useState([emptyIngredient()]);
    const [steps, setSteps] = useState([emptyStep()]);
    const [collections, setCollections] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // ─── Load existing recipe (edit mode) ────────────────────────────────────────
    useEffect(() => {
        if (!isEditing) return;
        const load = async () => {
            try {
                const [recipeRes, ingRes, instRes] = await Promise.all([
                    recipeAPI.getRecipeById(id),
                    ingredientAPI.getIngredients(id),
                    instructionAPI.getInstructions(id),
                ]);
                const r = recipeRes.data;
                setForm({
                    name: r.name || '', description: r.description || '',
                    prepTimeMinutes: r.prepTimeMinutes || '', cookTimeMinutes: r.cookTimeMinutes || '',
                    totalTimeMinutes: r.totalTimeMinutes || '', imageUrl: r.imageUrl || '',
                    isPublic: r.isPublic || false, notes: r.notes || '',
                });
                if (r.imageUrl) { setImagePreview(r.imageUrl); setUrlInput(r.imageUrl); }
                setIngredients(ingRes.data.length > 0
                    ? ingRes.data.map((i) => ({ ...i, _key: i.id }))
                    : [emptyIngredient()]
                );
                setSteps(instRes.data.length > 0
                    ? instRes.data.map((s) => ({ ...s, _key: s.id }))
                    : [emptyStep()]
                );
            } catch {
                setError('Failed to load recipe for editing.');
            }
        };
        load();
    }, [id, isEditing]);

    // ─── Load collections ────────────────────────────────────────────────────────
    useEffect(() => {
        collectionAPI.getCollections({ size: 100 })
            .then((res) => setCollections(res.data.content || []))
            .catch(() => { });
    }, []);

    // ─── Image helpers ────────────────────────────────────────────────────────────
    const handleFileSelected = (file) => {
        if (!file) return;
        const validationError = imageContext.validate(file);
        if (validationError) { setError(validationError); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError('');
    };

    const handleFileInputChange = (e) => {
        handleFileSelected(e.target.files?.[0]);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelected(e.dataTransfer.files?.[0]);
    };

    const handleUrlApply = () => {
        const validationError = imageContext.validate(urlInput.trim());
        if (validationError) { setError(validationError); return; }
        setImagePreview(urlInput.trim());
        setForm((f) => ({ ...f, imageUrl: urlInput.trim() }));
        setImageFile(null);
        setError('');
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setUrlInput('');
        setForm((f) => ({ ...f, imageUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Ingredient helpers ───────────────────────────────────────────────────────
    const addIngredient = () => setIngredients((p) => [...p, emptyIngredient()]);
    const updateIngredient = (key, field, val) =>
        setIngredients((p) => p.map((i) => i._key === key ? { ...i, [field]: val } : i));
    const removeIngredient = (key) =>
        setIngredients((p) => p.filter((i) => i._key !== key));

    // ─── Step helpers ─────────────────────────────────────────────────────────────
    const addStep = () => setSteps((p) => [...p, emptyStep()]);
    const updateStep = (key, val) =>
        setSteps((p) => p.map((s) => s._key === key ? { ...s, description: val } : s));
    const removeStep = (key) =>
        setSteps((p) => p.filter((s) => s._key !== key));

    const toggleCollection = (colId) =>
        setSelectedCollections((p) =>
            p.includes(colId) ? p.filter((c) => c !== colId) : [...p, colId]
        );

    // ─── Submit ───────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            // Strategy: delegate resolution to the active strategy.
            // CloudinaryStrategy uploads to Cloudinary and returns a CDN URL.
            // URLStrategy simply returns the trimmed URL string.
            // The submit handler never inspects which strategy is active.
            let resolvedImageUrl = form.imageUrl;

            if (imageFile || (imageMode === 'cloudinary' && imageFile)) {
                setUploading(true);
                resolvedImageUrl = await imageContext.resolve({ file: imageFile, url: urlInput });
                setUploading(false);
            } else if (imageMode === 'url' && urlInput.trim()) {
                resolvedImageUrl = await imageContext.resolve({ file: null, url: urlInput });
            }

            const recipePayload = {
                ...form,
                imageUrl: resolvedImageUrl || null,
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

            const validIngredients = ingredients.filter((i) => i.name.trim());
            const validSteps = steps.filter((s) => s.description.trim());

            if (!isEditing) {
                await Promise.all([
                    ...validIngredients.map((ing) =>
                        ingredientAPI.addIngredient(recipeId, {
                            name: ing.name.trim(),
                            quantity: ing.quantity ? Number(ing.quantity) : 0,
                            unit: ing.unit || null,
                            notes: ing.notes || null,
                        })
                    ),
                    ...validSteps.map((step, idx) =>
                        instructionAPI.addInstruction(recipeId, {
                            stepNumber: idx + 1,
                            description: step.description.trim(),
                        })
                    ),
                ]);
                if (selectedCollections.length > 0) {
                    await Promise.all(
                        selectedCollections.map((colId) =>
                            collectionAPI.addRecipeToCollection(colId, recipeId)
                        )
                    );
                }
            } else {
                await Promise.all([
                    ...validIngredients.filter((i) => i.id).map((ing) =>
                        ingredientAPI.updateIngredient(recipeId, ing.id, {
                            name: ing.name.trim(),
                            quantity: ing.quantity ? Number(ing.quantity) : 0,
                            unit: ing.unit || null,
                            notes: ing.notes || null,
                        })
                    ),
                    ...validSteps.filter((s) => s.id).map((step, idx) =>
                        instructionAPI.updateInstruction(recipeId, step.id, {
                            stepNumber: step.stepNumber || idx + 1,
                            description: step.description.trim(),
                        })
                    ),
                ]);
            }

            navigate(`/recipe/${recipeId}`);
        } catch (err) {
            setUploading(false);
            setError(err.message || err.response?.data?.message || 'Failed to save recipe. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────────
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
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Description</label>
                            <textarea
                                className={styles.formTextarea}
                                placeholder="Briefly describe your recipe…"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className={styles.formRow3}>
                            {[
                                { label: 'Prep Time (min)', field: 'prepTimeMinutes' },
                                { label: 'Cook Time (min)', field: 'cookTimeMinutes' },
                                { label: 'Total Time (min)', field: 'totalTimeMinutes' },
                            ].map(({ label, field }) => (
                                <div className={styles.formGroup} key={field}>
                                    <label className={styles.formLabel}>{label}</label>
                                    <input
                                        className={styles.formInput}
                                        type="number" min="0" placeholder="0"
                                        value={form[field]}
                                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* ── Image Upload (Strategy pattern) ── */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Recipe Photo</label>

                            {/* Mode tabs — switching tabs swaps the active strategy */}
                            <div className={styles.imageModeTabs}>
                                <button
                                    type="button"
                                    className={`${styles.imageModeTab} ${imageMode === 'cloudinary' ? styles.imageModeTabActive : ''}`}
                                    onClick={() => { setImageMode('cloudinary'); handleRemoveImage(); }}
                                >
                                    📷 Upload Photo
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.imageModeTab} ${imageMode === 'url' ? styles.imageModeTabActive : ''}`}
                                    onClick={() => { setImageMode('url'); handleRemoveImage(); }}
                                >
                                    🔗 Paste URL
                                </button>
                            </div>

                            {/* Cloudinary upload mode */}
                            {imageMode === 'cloudinary' && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className={styles.hiddenFileInput}
                                        onChange={handleFileInputChange}
                                    />

                                    {imagePreview ? (
                                        <div className={styles.imagePreviewWrap}>
                                            <img
                                                src={imagePreview}
                                                alt="Recipe preview"
                                                className={styles.imagePreview}
                                                onError={() => setImagePreview(null)}
                                            />
                                            <div className={styles.imagePreviewOverlay}>
                                                <button
                                                    type="button"
                                                    className={styles.imagePreviewChange}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    📷 Change Photo
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.imagePreviewRemove}
                                                    onClick={handleRemoveImage}
                                                >
                                                    🗑 Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={handleDrop}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                        >
                                            <div className={styles.dropZoneIcon}>🖼️</div>
                                            <div className={styles.dropZoneText}>
                                                <span className={styles.dropZonePrimary}>
                                                    Drop an image here or{' '}
                                                    <span className={styles.dropZoneLink}>browse files</span>
                                                </span>
                                                <span className={styles.dropZoneHint}>
                                                    JPEG, PNG, GIF, WEBP · max 10 MB · uploaded to Cloudinary
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {uploading && (
                                        <p style={{ fontSize: '0.8rem', color: '#7A5C46', marginTop: '6px' }}>
                                            ⏳ Uploading to Cloudinary…
                                        </p>
                                    )}
                                </>
                            )}

                            {/* URL paste mode */}
                            {imageMode === 'url' && (
                                <>
                                    <div className={styles.urlInputRow}>
                                        <input
                                            className={styles.formInput}
                                            type="url"
                                            placeholder="https://example.com/photo.jpg"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlApply())}
                                        />
                                        <button
                                            type="button"
                                            className={styles.urlApplyBtn}
                                            onClick={handleUrlApply}
                                            disabled={!urlInput.trim()}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                    {imagePreview && (
                                        <div className={styles.imagePreviewWrap} style={{ marginTop: '10px' }}>
                                            <img
                                                src={imagePreview}
                                                alt="Recipe preview"
                                                className={styles.imagePreview}
                                                onError={() => setImagePreview(null)}
                                            />
                                            <div className={styles.imagePreviewOverlay}>
                                                <button
                                                    type="button"
                                                    className={styles.imagePreviewRemove}
                                                    onClick={handleRemoveImage}
                                                >
                                                    🗑 Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
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
                                    className={styles.formInput} type="number" placeholder="Qty"
                                    value={ing.quantity} min="0" style={{ maxWidth: '80px' }}
                                    onChange={(e) => updateIngredient(ing._key, 'quantity', e.target.value)}
                                />
                                <select
                                    className={styles.formSelect} value={ing.unit} style={{ maxWidth: '90px' }}
                                    onChange={(e) => updateIngredient(ing._key, 'unit', e.target.value)}
                                >
                                    {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                                </select>
                                <input
                                    className={styles.formInput} type="text" placeholder="Ingredient name *"
                                    value={ing.name}
                                    onChange={(e) => updateIngredient(ing._key, 'name', e.target.value)}
                                />
                                <input
                                    className={styles.formInput} type="text" placeholder="Notes (optional)"
                                    value={ing.notes}
                                    onChange={(e) => updateIngredient(ing._key, 'notes', e.target.value)}
                                />
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
                                    value={step.description} rows={2}
                                    onChange={(e) => updateStep(step._key, e.target.value)}
                                />
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
                        <textarea
                            className={styles.formTextarea}
                            placeholder="Tips, variations, serving suggestions…"
                            value={form.notes} rows={4}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </section>

                    {/* Organization */}
                    <section className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>📂 Organization</h3>
                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={form.isPublic}
                                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                            />
                            <span>Make this recipe public</span>
                        </label>
                        {!isEditing && collections.length > 0 && (
                            <div className={styles.formGroup} style={{ marginTop: '14px' }}>
                                <label className={styles.formLabel}>Add to Collections</label>
                                <div className={styles.collectionsList}>
                                    {collections.map((col) => (
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
                            type="button" className={styles.btnOutline}
                            onClick={() => navigate(isEditing ? `/recipe/${id}` : '/recipes')}
                        >
                            Cancel
                        </button>
                        <button type="submit" className={styles.btnPrimary} disabled={saving || uploading}>
                            {uploading
                                ? '⏳ Uploading image…'
                                : saving
                                    ? 'Saving…'
                                    : `💾 ${isEditing ? 'Update Recipe' : 'Save Recipe'}`}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default withErrorBoundary(CreateRecipe);