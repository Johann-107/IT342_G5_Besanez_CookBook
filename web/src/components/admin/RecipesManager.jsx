import { useState, useEffect } from 'react';
import { Globe, Lock, CookingPot, Trash2, Loader2, ChefHat } from 'lucide-react';
import adminAPI from '../../services/admin';
import Pagination from './Pagination';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import styles from '../../styles/AdminDashboard.module.css';
import LoadingScreen from '../common/LoadingScreen';

const RecipesManager = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAdminRecipes({
                page,
                size: 10,
                sort: 'createdAt,desc',
                ...(search.trim() && { search: search.trim() }),
            });
            setRecipes(res.data.content || []);
            setTotalPages(res.data.page.totalPages || 0);
            setTotalElements(res.data.page.totalElements || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [page, search]);
    useEffect(() => {
        setPage(0);
    }, [search]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete recipe "${name}"? This cannot be undone.`)) return;
        setActionLoading(id);
        try {
            await adminAPI.deleteAdminRecipe(id);
            setRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch {
            alert('Failed to delete recipe.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={styles.managerWrap}>
            <div className={styles.managerHeader}>
                <span className={styles.managerCount}>{totalElements} recipes total</span>
                <input
                    className={styles.searchBar}
                    placeholder="Search by recipe name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {loading ? (
                <LoadingScreen
                    icon={<ChefHat size={52} strokeWidth={1.3} />}
                    message="Loading recipes..."
                    fullPage={false}
                />
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['Recipe', 'Owner ID', 'Visibility', 'Created', 'Actions'].map((h) => (
                                    <th key={h} className={styles.th}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recipes.map((r) => (
                                <tr key={r.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.recipeCell}>
                                            <div className={styles.recipeMiniThumb}>
                                                {r.imageUrl ? (
                                                    <img src={r.imageUrl} alt="" />
                                                ) : (
                                                    <CookingPot size={20} />
                                                )}
                                            </div>
                                            <span>{r.name}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.idChip}>#{r.userId}</span>
                                    </td>
                                    <td className={styles.td}>
                                        {r.isPublic ? (
                                            <span className={styles.publicBadge}>
                                                <Globe size={14} /> Public
                                            </span>
                                        ) : (
                                            <span className={styles.privateBadge}>
                                                <Lock size={14} /> Private
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.td}>{formatRelativeTime(r.createdAt)}</td>
                                    <td className={styles.td}>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() => handleDelete(r.id, r.name)}
                                            disabled={actionLoading === r.id}
                                        >
                                            {actionLoading === r.id ? (
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

export default RecipesManager;