import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import collectionAPI from '../services/collection';
import recipeAPI from '../services/recipe';
import AddRecipesModal from '../components/AddRecipesModal';
import {
    ImageUploadContext,
    IMAGE_STRATEGIES,
} from '../patterns/ImageUploadStrategy';
import { withErrorBoundary } from '../patterns/ComponentDecorators';
import styles from '../styles/CollectionDetail.module.css';

const BG_CLASSES = ['rc1', 'rc2', 'rc3', 'rc4', 'rc5', 'rc6'];
const EMOJI_MAP = ['🥘', '🥗', '🍋', '🍝', '🍜', '🥧', '🍲', '🥩', '🍰', '🥞'];

const COLOR_CLASSES = ['rust', 'sage', 'amber', 'rose', 'sky', 'plum'];
const COLOR_GRADIENTS = {
    rust: 'linear-gradient(135deg, #D4845A, #B86640)',
    sage: 'linear-gradient(135deg, #7BAE7F, #5A8F5E)',
    amber: 'linear-gradient(135deg, #D9A84A, #B88428)',
    rose: 'linear-gradient(135deg, #D47B85, #B85A65)',
    sky: 'linear-gradient(135deg, #6BA3BF, #4A82A0)',
    plum: 'linear-gradient(135deg, #9B6BAB, #7A4A8A)',
};

const CollectionDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [collection, setCollection] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    // Add Recipes modal
    const [showAddRecipesModal, setShowAddRecipesModal] = useState(false);

    const [imageMode, setImageMode] = useState('cloudinary');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [urlInput, setUrlInput] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    const imageContext = useMemo(() => new ImageUploadContext(IMAGE_STRATEGIES[imageMode]), []);
    useEffect(() => {
        imageContext.setStrategy(IMAGE_STRATEGIES[imageMode]);
    }, [imageMode, imageContext]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [colRes, recipesRes] = await Promise.all([
                collectionAPI.getCollectionById(id),
                recipeAPI.getRecipes({ collection: id, size: 200, sort: 'createdAt,desc' }),
            ]);
            setCollection(colRes.data);
            setRecipes(recipesRes.data.content || []);
        } catch {
            setError('Failed to load collection. It may not exist or you may not have access.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const colorClass = COLOR_CLASSES[Number(id) % COLOR_CLASSES.length];
    const colorGradient = COLOR_GRADIENTS[colorClass];

    const handleFileSelected = (file) => {
        if (!file) return;
        const validationError = imageContext.validate(file);
        if (validationError) { setError(validationError); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError('');
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
        setImageFile(null);
        setError('');
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setUrlInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openEditModal = () => {
        setEditForm({ name: collection.name, description: collection.description || '' });
        setImagePreview(collection.coverImage || null);
        setUrlInput(collection.coverImage || '');
        setImageFile(null);
        setImageMode('cloudinary');
        setShowEditModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let resolvedImageUrl = collection.coverImage || null;

            if (imageFile) {
                setUploading(true);
                resolvedImageUrl = await imageContext.resolve({
                    file: imageFile,
                    userId: user?.userId,
                });
                setUploading(false);
            } else if (imageMode === 'url' && urlInput.trim()) {
                resolvedImageUrl = urlInput.trim();
            } else if (!imagePreview) {
                resolvedImageUrl = null;
            }

            const res = await collectionAPI.updateCollection(id, {
                name: editForm.name,
                description: editForm.description,
                coverImage: resolvedImageUrl,
            });
            setCollection(res.data);
            setShowEditModal(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update collection.');
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${collection.name}"? This cannot be undone.`)) return;
        try {
            await collectionAPI.deleteCollection(id);
            navigate('/collections');
        } catch {
            setError('Failed to delete collection.');
        }
    };

    const handleRemoveRecipe = async (e, recipeId) => {
        e.stopPropagation();
        if (!window.confirm('Remove this recipe from the collection?')) return;
        try {
            await collectionAPI.removeRecipeFromCollection(id, recipeId);
            setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            setCollection((prev) => ({ ...prev, recipeCount: (prev.recipeCount || 1) - 1 }));
        } catch {
            setError('Failed to remove recipe.');
        }
    };

    // Called when AddRecipesModal successfully adds recipes
    const handleRecipesAdded = async (count) => {
        // Reload the collection and recipes to show updated state
        await loadData();
        setShowAddRecipesModal(false);
    };

    const formatTime = (minutes) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
        });
    };

    if (loading) {
        return (
            <>
                <DefaultHeader user={user} />
                <div className={styles.loadingState}>
                    <div className={styles.loadingEmoji}>📂</div>
                    <p>Loading collection…</p>
                </div>
            </>
        );
    }

    if (error && !collection) {
        return (
            <>
                <DefaultHeader user={user} />
                <div className={styles.errorState}>
                    <div className={styles.errorEmoji}>😕</div>
                    <h3>{error}</h3>
                    <button className={styles.btnGhost} onClick={() => navigate('/collections')}>
                        ← Back to Collections
                    </button>
                </div>
            </>
        );
    }

    const hasCover = Boolean(collection?.coverImage);
    const heroStyle = hasCover
        ? {
            backgroundImage: `linear-gradient(to bottom, rgba(92,61,46,0.45) 0%, rgba(58,42,30,0.72) 100%), url(${collection.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : { background: colorGradient };

    const existingRecipeIds = recipes.map(r => r.id);

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>

                <div className={`${styles.hero} ${hasCover ? styles.heroWithImage : ''}`} style={heroStyle}>
                    <button className={styles.backBtn} onClick={() => navigate('/collections')}>
                        ← Collections
                    </button>
                    <div className={styles.heroContent}>
                        <div className={styles.heroLeft}>
                            <div className={styles.collectionEmoji}>
                                {hasCover ? null : '📂'}
                            </div>
                            <h1 className={styles.collectionTitle}>{collection.name}</h1>
                            {collection.description && (
                                <p className={styles.collectionDesc}>{collection.description}</p>
                            )}
                            <div className={styles.heroBadges}>
                                <span className={styles.badge}>
                                    📖 {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
                                </span>
                                {collection.createdAt && (
                                    <span className={styles.badge}>
                                        🗓 Created {formatDate(collection.createdAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={styles.heroActions}>
                            <button className={styles.btnHeroEdit} onClick={openEditModal}>
                                ✏️ Edit
                            </button>
                            <button className={styles.btnHeroDanger} onClick={handleDelete}>
                                🗑 Delete
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorBanner}>{error}</div>
                )}

                <div className={styles.body}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recipes in this Collection</h2>
                        {/* Changed from navigate to open modal */}
                        <button
                            className={styles.btnAddRecipes}
                            onClick={() => setShowAddRecipesModal(true)}
                        >
                            + Add Recipes
                        </button>
                    </div>

                    {recipes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyEmoji}>🍳</div>
                            <h3 className={styles.emptyTitle}>No recipes yet</h3>
                            <p className={styles.emptyText}>
                                Add recipes to this collection from your recipe library.
                            </p>
                            {/* Changed from navigate to open modal */}
                            <button
                                className={styles.btnPrimary}
                                onClick={() => setShowAddRecipesModal(true)}
                            >
                                Browse My Recipes
                            </button>
                        </div>
                    ) : (
                        <div className={styles.recipeGrid}>
                            {recipes.map((recipe, index) => (
                                <div
                                    key={recipe.id}
                                    className={styles.recipeCard}
                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
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
                                                ? <span className={styles.tagPublic}>🌐</span>
                                                : <span className={styles.tagPrivate}>🔒</span>
                                            }
                                        </div>
                                        {recipe.description && (
                                            <p className={styles.recipeCardDesc}>
                                                {recipe.description.slice(0, 60)}{recipe.description.length > 60 ? '…' : ''}
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
                                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                                                >👁️</button>
                                                <button
                                                    className={styles.iconBtnDanger}
                                                    title="Remove from collection"
                                                    onClick={(e) => handleRemoveRecipe(e, recipe.id)}
                                                >✕</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.btnGhost} onClick={() => navigate('/collections')}>
                        ← Back to Collections
                    </button>
                </div>
            </div>

            {/* Add Recipes Modal */}
            {showAddRecipesModal && (
                <AddRecipesModal
                    collectionId={Number(id)}
                    existingIds={existingRecipeIds}
                    onClose={() => setShowAddRecipesModal(false)}
                    onSaved={handleRecipesAdded}
                />
            )}

            {/* Edit Collection Modal */}
            {showEditModal && (
                <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>×</button>

                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Edit Collection</h3>
                            <p className={styles.modalSubtitle}>Update your collection details and cover image</p>
                        </div>

                        <form onSubmit={handleSave} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Collection Name *</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                    maxLength={100}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="What's this collection about?"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    maxLength={255}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Cover Image</label>

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

                                {imageMode === 'cloudinary' && (
                                    <>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            className={styles.hiddenFileInput}
                                            onChange={(e) => { handleFileSelected(e.target.files?.[0]); e.target.value = ''; }}
                                        />
                                        {imagePreview ? (
                                            <div className={styles.imagePreviewWrap}>
                                                <img src={imagePreview} alt="Cover preview" className={styles.imagePreview} onError={() => setImagePreview(null)} />
                                                <div className={styles.imagePreviewOverlay}>
                                                    <button type="button" className={styles.imagePreviewChange} onClick={() => fileInputRef.current?.click()}>📷 Change</button>
                                                    <button type="button" className={styles.imagePreviewRemove} onClick={handleRemoveImage}>🗑 Remove</button>
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
                                                    <span className={styles.dropZonePrimary}>Drop an image here or <span className={styles.dropZoneLink}>browse</span></span>
                                                    <span className={styles.dropZoneHint}>JPEG, PNG, GIF, WEBP · max 5 MB</span>
                                                </div>
                                            </div>
                                        )}
                                        {uploading && <p className={styles.uploadingHint}>⏳ Uploading…</p>}
                                    </>
                                )}

                                {imageMode === 'url' && (
                                    <>
                                        <div className={styles.urlInputRow}>
                                            <input
                                                className={styles.formInput}
                                                type="url"
                                                placeholder="https://example.com/cover.jpg"
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlApply())}
                                            />
                                            <button type="button" className={styles.urlApplyBtn} onClick={handleUrlApply} disabled={!urlInput.trim()}>Preview</button>
                                        </div>
                                        {imagePreview && (
                                            <div className={styles.imagePreviewWrap} style={{ marginTop: '10px' }}>
                                                <img src={imagePreview} alt="Cover preview" className={styles.imagePreview} onError={() => setImagePreview(null)} />
                                                <div className={styles.imagePreviewOverlay}>
                                                    <button type="button" className={styles.imagePreviewRemove} onClick={handleRemoveImage}>🗑 Remove</button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnOutline} onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className={styles.btnPrimary} disabled={saving || uploading}>
                                    {uploading ? '⏳ Uploading…' : saving ? 'Saving…' : '💾 Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default withErrorBoundary(CollectionDetail);