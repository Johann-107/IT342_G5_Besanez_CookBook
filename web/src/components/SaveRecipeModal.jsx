import { useState, useEffect } from 'react';
import collectionAPI from '../services/collection';
import shareAPI from '../services/share';
import styles from '../styles/SaveRecipeModal.module.css';

/**
 * SaveRecipeModal
 *
 * Props:
 *   token      {string}   — share token from the URL
 *   recipe     {object}   — the previewed recipe (name, etc.)
 *   onClose    {function}
 *   onSaved    {function(savedRecipe)} — called after successful save
 */
const SaveRecipeModal = ({ token, recipe, onClose, onSaved }) => {
    const [collections, setCollections] = useState([]);
    const [selected, setSelected] = useState([]);
    const [saveAsPrivate, setSaveAsPrivate] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingCols, setLoadingCols] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await collectionAPI.getCollections({ size: 100, sort: 'name,asc' });
                setCollections(res.data.content || []);
            } catch {
                // Non-fatal — user can still save without a collection
            } finally {
                setLoadingCols(false);
            }
        };
        load();
    }, []);

    const toggleCollection = (id) =>
        setSelected(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await shareAPI.saveSharedRecipe(token, selected);
            onSaved(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save recipe. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <div className={styles.modalHeader}>
                    <div className={styles.headerEmoji}>📥</div>
                    <h2 className={styles.modalTitle}>Save Recipe</h2>
                    <p className={styles.modalSubtitle}>
                        <strong>"{recipe?.name}"</strong> will be saved as a private copy in your cookbook.
                    </p>
                </div>

                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMsg}>{error}</div>}

                    {/* Private badge */}
                    <div className={styles.privateBadge}>
                        <span className={styles.privateBadgeIcon}>🔒</span>
                        <div>
                            <div className={styles.privateBadgeTitle}>Saved as Private</div>
                            <div className={styles.privateBadgeDesc}>Only you can see this recipe</div>
                        </div>
                    </div>

                    {/* Collection picker */}
                    <div className={styles.collSection}>
                        <div className={styles.collSectionHeader}>
                            <span className={styles.collSectionTitle}>Add to Collections</span>
                            <span className={styles.collSectionHint}>optional</span>
                        </div>

                        {loadingCols ? (
                            <div className={styles.collLoading}>Loading your collections…</div>
                        ) : collections.length === 0 ? (
                            <div className={styles.collEmpty}>
                                You don't have any collections yet.
                                <br />
                                <span className={styles.collEmptyHint}>
                                    You can organise this recipe later from your cookbook.
                                </span>
                            </div>
                        ) : (
                            <div className={styles.collList}>
                                {collections.map(col => (
                                    <label
                                        key={col.id}
                                        className={`${styles.collItem} ${selected.includes(col.id) ? styles.collItemSelected : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.collCheckbox}
                                            checked={selected.includes(col.id)}
                                            onChange={() => toggleCollection(col.id)}
                                        />
                                        <span className={styles.collName}>📂 {col.name}</span>
                                        <span className={styles.collCount}>{col.recipeCount} recipes</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={styles.btnOutline}
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.btnPrimary}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? 'Saving…'
                            : selected.length > 0
                                ? `💾 Save to ${selected.length} collection${selected.length > 1 ? 's' : ''}`
                                : '💾 Save to My Cookbook'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveRecipeModal;