import { useState, useEffect } from 'react';
import collectionAPI from '../services/collection';
import styles from '../styles/AddToCollectionModal.module.css';

/**
 * AddToCollectionModal
 *
 * Props:
 *   recipe     {object}   — { id, name }
 *   onClose    {function}
 *   onSaved    {function(collectionIds)} — called after successful add
 */
const AddToCollectionModal = ({ recipe, onClose, onSaved }) => {
    const [collections, setCollections] = useState([]);
    const [selected, setSelected] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loadingCols, setLoadingCols] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await collectionAPI.getCollections({ size: 100, sort: 'name,asc' });
                setCollections(res.data.content || []);
            } catch {
                setError('Failed to load collections.');
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
        if (selected.length === 0) return;
        setSaving(true);
        setError('');
        try {
            await Promise.all(
                selected.map(colId => collectionAPI.addRecipeToCollection(colId, recipe.id))
            );
            setSuccess(`Added to ${selected.length} collection${selected.length > 1 ? 's' : ''}!`);
            setTimeout(() => {
                onSaved && onSaved(selected);
                onClose();
            }, 900);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add recipe to collection.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <div className={styles.modalHeader}>
                    <div className={styles.headerEmoji}>📂</div>
                    <h2 className={styles.modalTitle}>Add to Collection</h2>
                    <p className={styles.modalSubtitle}>
                        Adding <strong>"{recipe?.name}"</strong> to your collections
                    </p>
                </div>

                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMsg}>{error}</div>}
                    {success && <div className={styles.successMsg}>✓ {success}</div>}

                    <div className={styles.collSection}>
                        <div className={styles.collSectionHeader}>
                            <span className={styles.collSectionTitle}>Your Collections</span>
                            {selected.length > 0 && (
                                <span className={styles.collSectionHint}>{selected.length} selected</span>
                            )}
                        </div>

                        {loadingCols ? (
                            <div className={styles.collLoading}>Loading collections…</div>
                        ) : collections.length === 0 ? (
                            <div className={styles.collEmpty}>
                                You don't have any collections yet.
                                <br />
                                <span className={styles.collEmptyHint}>
                                    Create a collection first from the Collections page.
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
                        disabled={saving || selected.length === 0 || loadingCols}
                    >
                        {saving
                            ? 'Adding…'
                            : selected.length > 0
                                ? `📂 Add to ${selected.length} collection${selected.length > 1 ? 's' : ''}`
                                : 'Select a collection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;