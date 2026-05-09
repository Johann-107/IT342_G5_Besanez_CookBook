import { useState } from 'react';
import { X, Save } from 'lucide-react';
import collectionAPI from '../collection';
import styles from '../CollectionDetail.module.css';

const CollectionModal = ({ mode = 'edit', collection = null, onClose, onSaved }) => {
    const [form, setForm] = useState({
        name: collection?.name ?? '',
        description: collection?.description ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isEdit = mode === 'edit';

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = isEdit
                ? await collectionAPI.updateCollection(collection.id, form)
                : await collectionAPI.createCollection(form);
            onSaved(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save collection.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={18} strokeWidth={2.5} />
                </button>

                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        {isEdit ? 'Edit Collection' : 'New Collection'}
                    </h3>
                </div>

                <form onSubmit={handleSave} className={styles.modalForm}>
                    {error && <div className={styles.errorBanner}>{error}</div>}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Collection Name *</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            placeholder="e.g. Weeknight Dinners"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            maxLength={255}
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.btnOutline} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.btnPrimary} disabled={saving}>
                            {saving ? 'Saving…' : (
                                <><Save size={14} strokeWidth={2} style={{ marginRight: 5 }} />
                                    {isEdit ? 'Save Changes' : 'Create Collection'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectionModal;