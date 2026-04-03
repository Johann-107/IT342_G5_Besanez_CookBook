import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import collectionAPI from '../services/collection';
import styles from '../styles/Collections.module.css';

const COLOR_CLASSES = ['rust', 'sage', 'amber', 'rose', 'sky', 'plum'];

const Collections = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('createdAt,desc');
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null); // null = creating, object = editing
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    const fetchCollections = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                size: 50,
                sort: sortBy,
                ...(search.trim() && { search: search.trim() }),
            };
            const res = await collectionAPI.getCollections(params);
            setCollections(res.data.content || []);
        } catch {
            setError('Failed to load collections.');
        } finally {
            setLoading(false);
        }
    }, [search, sortBy]);

    useEffect(() => {
        const debounce = setTimeout(fetchCollections, 300);
        return () => clearTimeout(debounce);
    }, [fetchCollections]);

    const openCreate = () => {
        setEditTarget(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const openEdit = (e, col) => {
        e.stopPropagation();
        setEditTarget(col);
        setFormData({ name: col.name, description: col.description || '' });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editTarget) {
                const res = await collectionAPI.updateCollection(editTarget.id, formData);
                setCollections(prev =>
                    prev.map(c => c.id === editTarget.id ? res.data : c)
                );
            } else {
                const res = await collectionAPI.createCollection(formData);
                setCollections(prev => [res.data, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save collection.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (e, col) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${col.name}"? This cannot be undone.`)) return;
        try {
            await collectionAPI.deleteCollection(col.id);
            setCollections(prev => prev.filter(c => c.id !== col.id));
        } catch {
            alert('Failed to delete collection.');
        }
    };

    const totalRecipes = collections.reduce((a, c) => a + (c.recipeCount || 0), 0);

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>My Collections</h2>
                        <p className={styles.pageSubtitle}>
                            {collections.length} collections · {totalRecipes} recipes total
                        </p>
                    </div>
                    <button className={styles.btnPrimary} onClick={openCreate}>
                        + New Collection
                    </button>
                </div>

                <div className={styles.filterBar}>
                    <input
                        className={styles.searchInput}
                        placeholder="🔍 Search collections…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="name,asc">Sort: Name A–Z</option>
                        <option value="createdAt,desc">Sort: Newest</option>
                        <option value="createdAt,asc">Sort: Oldest</option>
                    </select>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingEmoji}>📂</div>
                        <p>Loading collections…</p>
                    </div>
                ) : (
                    <div className={styles.collGrid}>
                        {collections.map((col, index) => (
                            <div
                                key={col.id}
                                className={styles.collCard}
                                onClick={() => navigate(`/collections/${col.id}`)}
                            >
                                <div className={`${styles.colorBar} ${styles[COLOR_CLASSES[index % COLOR_CLASSES.length]]}`} />
                                <div className={styles.collCardBody}>
                                    <div className={styles.collCardName}>{col.name}</div>
                                    {col.description && (
                                        <div className={styles.collCardDesc}>{col.description}</div>
                                    )}
                                    <div className={styles.collCardFooter}>
                                        <span className={styles.collCount}>{col.recipeCount || 0} recipes</span>
                                    </div>
                                    <div
                                        className={styles.cardActions}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <button
                                            className={styles.iconBtn}
                                            title="Edit"
                                            onClick={e => openEdit(e, col)}
                                        >✏️</button>
                                        <button
                                            className={styles.iconBtn}
                                            title="Delete"
                                            onClick={e => handleDelete(e, col)}
                                        >🗑</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add new card */}
                        <div className={styles.newCollCard} onClick={openCreate}>
                            <div className={styles.newCollInner}>
                                <div className={styles.newCollIcon}>➕</div>
                                <div className={styles.newCollLabel}>New Collection</div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && collections.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyEmoji}>📂</div>
                        <h3 className={styles.emptyTitle}>
                            {search ? 'No collections found' : 'No collections yet'}
                        </h3>
                        <p className={styles.emptyText}>
                            {search ? 'Try a different search term.' : 'Create your first collection to organise your recipes.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editTarget ? 'Edit Collection' : 'New Collection'}
                            </h3>
                            <p className={styles.modalSubtitle}>
                                {editTarget
                                    ? 'Update your collection details'
                                    : 'Organise your recipes into a collection'}
                            </p>
                        </div>
                        <form onSubmit={handleSave} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Collection Name *</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="e.g. Weeknight Dinners"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    autoFocus
                                    maxLength={100}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="What's this collection about?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    maxLength={255}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.btnOutline}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnPrimary}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving…' : editTarget ? 'Update' : 'Create Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Collections;