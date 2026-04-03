import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import styles from '../styles/Collections.module.css';

const COLORS = ['rust', 'sage', 'amber', 'rose', 'sky', 'plum'];

const Collections = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showModal, setShowModal] = useState(false);
    const [newCollection, setNewCollection] = useState({ name: '', description: '' });

    const collections = [
        { id: 1, name: 'Dinner Mains', description: 'Hearty main courses for every night', count: 18, color: 'rust', icons: ['🍖', '🥩', '🐟'] },
        { id: 2, name: 'Healthy Salads', description: 'Fresh and nutritious salad ideas', count: 7, color: 'sage', icons: ['🥬', '🍅', '🥕'] },
        { id: 3, name: 'Baked Goods', description: 'Breads, cakes, and pastries', count: 11, color: 'amber', icons: ['🧁', '🍞', '🥐'] },
        { id: 4, name: 'Weekend Feasts', description: 'Special occasion showstoppers', count: 5, color: 'rose', icons: ['🍷', '🥩', '🎂'] },
        { id: 5, name: 'Quick Breakfasts', description: 'Under 20 min morning meals', count: 9, color: 'sky', icons: ['🥣', '🍳', '🥞'] },
    ];

    const filtered = collections.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateCollection = (e) => {
        e.preventDefault();
        // TODO: wire to API
        setShowModal(false);
        setNewCollection({ name: '', description: '' });
    };

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>My Collections</h2>
                        <p className={styles.pageSubtitle}>{collections.length} collections · {collections.reduce((a, c) => a + c.count, 0)} recipes total</p>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
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
                    <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="name">Sort: Name A–Z</option>
                        <option value="count">Sort: Most Recipes</option>
                        <option value="newest">Sort: Newest</option>
                    </select>
                </div>

                <div className={styles.collGrid}>
                    {filtered.map(col => (
                        <div
                            key={col.id}
                            className={styles.collCard}
                            onClick={() => navigate(`/collections/${col.id}`)}
                        >
                            <div className={`${styles.colorBar} ${styles[col.color]}`} />
                            <div className={styles.collCardBody}>
                                <div className={styles.collCardName}>{col.name}</div>
                                <div className={styles.collCardDesc}>{col.description}</div>
                                <div className={styles.collCardFooter}>
                                    <span className={styles.collCount}>{col.count} recipes</span>
                                    <div className={styles.collIcons}>
                                        {col.icons.map((icon, i) => (
                                            <div key={i} className={styles.collIconBubble}>{icon}</div>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    className={styles.cardActions}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <button className={styles.iconBtn} title="Edit">✏️</button>
                                    <button className={styles.iconBtn} title="Delete">🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* New Collection Card */}
                    <div
                        className={styles.newCollCard}
                        onClick={() => setShowModal(true)}
                    >
                        <div className={styles.newCollInner}>
                            <div className={styles.newCollIcon}>➕</div>
                            <div className={styles.newCollLabel}>New Collection</div>
                        </div>
                    </div>
                </div>

                {filtered.length === 0 && search && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyEmoji}>📂</div>
                        <h3 className={styles.emptyTitle}>No collections found</h3>
                        <p className={styles.emptyText}>Try a different search term.</p>
                    </div>
                )}
            </div>

            {/* Create Collection Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>New Collection</h3>
                            <p className={styles.modalSubtitle}>Organize your recipes into a collection</p>
                        </div>
                        <form onSubmit={handleCreateCollection} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Collection Name *</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="e.g. Weeknight Dinners"
                                    value={newCollection.name}
                                    onChange={e => setNewCollection({ ...newCollection, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="What's this collection about?"
                                    value={newCollection.description}
                                    onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnOutline} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btnPrimary}>
                                    Create Collection
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