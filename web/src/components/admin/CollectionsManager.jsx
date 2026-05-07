import { useState, useEffect } from 'react';
import { FolderOpen, Trash2, Loader2, ChefHat } from 'lucide-react';
import adminAPI from '../../services/admin';
import Pagination from './Pagination';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import styles from '../../styles/AdminDashboard.module.css';
import LoadingScreen from '../common/LoadingScreen';

const CollectionsManager = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAdminCollections({
                page,
                size: 10,
                sort: 'createdAt,desc',
            });
            setCollections(res.data.content || []);
            setTotalPages(res.data.page.totalPages || 0);
            setTotalElements(res.data.page.totalElements || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [page]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete collection "${name}"? This cannot be undone.`)) return;
        setActionLoading(id);
        try {
            await adminAPI.deleteAdminCollection(id);
            setCollections((prev) => prev.filter((c) => c.id !== id));
        } catch {
            alert('Failed to delete collection.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={styles.managerWrap}>
            <div className={styles.managerHeader}>
                <span className={styles.managerCount}>{totalElements} collections total</span>
            </div>
            {loading ? (
                <LoadingScreen
                    icon={<ChefHat size={52} strokeWidth={1.3} />}
                    message="Loading collections..."
                    fullPage={false}
                />
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['Collection', 'Owner ID', 'Recipes', 'Created', 'Actions'].map((h) => (
                                    <th key={h} className={styles.th}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((c) => (
                                <tr key={c.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.collectionCell}>
                                            <div className={styles.collMiniThumb}>
                                                {c.coverImage ? (
                                                    <img src={c.coverImage} alt="" />
                                                ) : (
                                                    <FolderOpen size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className={styles.collName}>{c.name}</div>
                                                {c.description && (
                                                    <div className={styles.collDesc}>
                                                        {c.description.slice(0, 50)}
                                                        {c.description.length > 50 ? '…' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.idChip}>#{c.userId}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.countChip}>{c.recipeCount}</span>
                                    </td>
                                    <td className={styles.td}>{formatRelativeTime(c.createdAt)}</td>
                                    <td className={styles.td}>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() => handleDelete(c.id, c.name)}
                                            disabled={actionLoading === c.id}
                                        >
                                            {actionLoading === c.id ? (
                                                <Loader2 size={16} />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </div>
    );
};

export default CollectionsManager;