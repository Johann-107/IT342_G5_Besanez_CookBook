import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Camera, Link, ImageIcon, Save } from 'lucide-react';
import collectionAPI from '../../services/collection';
import { ImageUploadContext, IMAGE_STRATEGIES } from '../../patterns/ImageUploadStrategy';
import styles from '../../styles/CollectionDetail.module.css';

/**
 * CollectionEditModal
 *
 * Props:
 *   collection  {object}    — current collection data (used to seed form state)
 *   user        {object}    — current user (userId used for Cloudinary folder path)
 *   onClose     {function}
 *   onSaved     {function(updatedCollection)} — called after a successful save
 */
const CollectionEditModal = ({ collection, user, onClose, onSaved }) => {
    const fileInputRef = useRef(null);

    const [editForm, setEditForm] = useState({
        name: collection.name,
        description: collection.description || '',
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const [imageMode, setImageMode] = useState('cloudinary');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(collection.coverImage || null);
    const [urlInput, setUrlInput] = useState(collection.coverImage || '');
    const [dragOver, setDragOver] = useState(false);

    const imageContext = useMemo(() => new ImageUploadContext(IMAGE_STRATEGIES.cloudinary), []);
    useEffect(() => {
        imageContext.setStrategy(IMAGE_STRATEGIES[imageMode]);
    }, [imageMode, imageContext]);

    const handleFileSelected = (file) => {
        if (!file) return;
        const validationError = imageContext.validate(file);
        if (validationError) { setError(validationError); return; }
        setError('');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelected(e.dataTransfer.files?.[0]);
    };

    const handleUrlApply = () => {
        const validationError = imageContext.validate(urlInput.trim());
        if (validationError) { setError(validationError); return; }
        setError('');
        setImagePreview(urlInput.trim());
        setImageFile(null);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setUrlInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            let resolvedImageUrl = collection.coverImage || null;

            if (imageFile) {
                setUploading(true);
                resolvedImageUrl = await imageContext.resolve({ file: imageFile, userId: user?.userId });
                setUploading(false);
            } else if (imageMode === 'url' && urlInput.trim()) {
                resolvedImageUrl = urlInput.trim();
            } else if (!imagePreview) {
                resolvedImageUrl = null;
            }

            const res = await collectionAPI.updateCollection(collection.id, {
                name: editForm.name,
                description: editForm.description,
                coverImage: resolvedImageUrl,
            });
            onSaved(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update collection.');
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={18} strokeWidth={2.5} />
                </button>

                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Edit Collection</h3>
                    <p className={styles.modalSubtitle}>Update your collection details and cover image</p>
                </div>

                <form onSubmit={handleSave} className={styles.modalForm}>
                    {error && <div className={styles.errorBanner}>{error}</div>}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Collection Name *</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required maxLength={100} autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Description</label>
                        <textarea
                            className={styles.formTextarea}
                            placeholder="What's this collection about?"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={3} maxLength={255}
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
                                <Camera size={13} strokeWidth={2} style={{ marginRight: 5 }} />
                                Upload Photo
                            </button>
                            <button
                                type="button"
                                className={`${styles.imageModeTab} ${imageMode === 'url' ? styles.imageModeTabActive : ''}`}
                                onClick={() => { setImageMode('url'); handleRemoveImage(); }}
                            >
                                <Link size={13} strokeWidth={2} style={{ marginRight: 5 }} />
                                Paste URL
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
                                        <img
                                            src={imagePreview}
                                            alt="Cover preview"
                                            className={styles.imagePreview}
                                            onError={() => setImagePreview(null)}
                                        />
                                        <div className={styles.imagePreviewOverlay}>
                                            <button
                                                type="button"
                                                className={styles.imagePreviewChange}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Camera size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                                                Change
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.imagePreviewRemove}
                                                onClick={handleRemoveImage}
                                            >
                                                Remove
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
                                        <div className={styles.dropZoneIcon}>
                                            <ImageIcon size={32} strokeWidth={1.5} color="var(--text-light, #B09080)" />
                                        </div>
                                        <div className={styles.dropZoneText}>
                                            <span className={styles.dropZonePrimary}>
                                                Drop an image here or{' '}
                                                <span className={styles.dropZoneLink}>browse</span>
                                            </span>
                                            <span className={styles.dropZoneHint}>
                                                JPEG, PNG, GIF, WEBP · max 5 MB
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {uploading && <p className={styles.uploadingHint}>Uploading…</p>}
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
                                    <div className={styles.imagePreviewWrap} style={{ marginTop: 10 }}>
                                        <img
                                            src={imagePreview}
                                            alt="Cover preview"
                                            className={styles.imagePreview}
                                            onError={() => setImagePreview(null)}
                                        />
                                        <div className={styles.imagePreviewOverlay}>
                                            <button
                                                type="button"
                                                className={styles.imagePreviewRemove}
                                                onClick={handleRemoveImage}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.btnOutline} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.btnPrimary} disabled={saving || uploading}>
                            {uploading ? 'Uploading…' : saving ? 'Saving…' : (
                                <><Save size={14} strokeWidth={2} style={{ marginRight: 5 }} />Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectionEditModal;