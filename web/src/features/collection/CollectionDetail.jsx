import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DefaultHeader from '../../shared/layout/DefaultHeader';
import collectionAPI from './collection';
import recipeAPI from '../recipe/recipe';
import AddRecipesModal from './components/AddRecipesModal';
import CollectionHero from './components/CollectionHero';
import CollectionModal from './components/CollectionModal';
import CollectionRecipeGrid from './components/CollectionRecipeGrid';
import { withErrorBoundary } from '../../shared/patterns/ComponentDecorators';
import {
    ArrowLeft,
    Plus,
    ChefHat,
    AlertCircle,
} from 'lucide-react';
import styles from './CollectionDetail.module.css';
import LoadingScreen from '../../shared/components/LoadingScreen';

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

    const [collection, setCollection] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddRecipesModal, setShowAddRecipesModal] = useState(false);

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

    useEffect(() => { loadData(); }, [id]);

    const colorClass = COLOR_CLASSES[Number(id) % COLOR_CLASSES.length];
    const colorGradient = COLOR_GRADIENTS[colorClass];
    const hasCover = Boolean(collection?.coverImage);

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${collection.name}"? This cannot be undone.`)) return;
        try {
            await collectionAPI.deleteCollection(id);
            navigate('/collections');
        } catch {
            setError('Failed to delete collection.');
        }
    };

    const handleRemoveRecipe = async (recipeId) => {
        if (!window.confirm('Remove this recipe from the collection?')) return;
        try {
            await collectionAPI.removeRecipeFromCollection(id, recipeId);
            setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            setCollection((prev) => ({ ...prev, recipeCount: (prev.recipeCount || 1) - 1 }));
        } catch {
            setError('Failed to remove recipe.');
        }
    };

    const handleRecipesAdded = async () => {
        await loadData();
        setShowAddRecipesModal(false);
    };

    if (loading) {
        return (
            <>
                <DefaultHeader user={user} />
                <LoadingScreen
                    icon={<ChefHat size={52} strokeWidth={1.3} />}
                    message="Loading collection details..."
                    fullPage={false}
                />
            </>
        );
    }

    if (error && !collection) {
        return (
            <>
                <DefaultHeader user={user} />
                <div className={styles.errorState}>
                    <AlertCircle size={52} strokeWidth={1.3} color="var(--text-light, #B09080)" />
                    <h3>{error}</h3>
                    <button className={styles.btnGhost} onClick={() => navigate('/collections')}>
                        <ArrowLeft size={15} strokeWidth={2} style={{ marginRight: 5 }} />
                        Back to Collections
                    </button>
                </div>
            </>
        );
    }

    const existingRecipeIds = recipes.map((r) => r.id);

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>

                <CollectionHero
                    collection={collection}
                    recipeCount={recipes.length}
                    colorGradient={colorGradient}
                    hasCover={hasCover}
                    onBack={() => navigate('/collections')}
                    onEdit={() => setShowEditModal(true)}
                    onDelete={handleDelete}
                />

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.body}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recipes in this Collection</h2>
                        <button className={styles.btnAddRecipes} onClick={() => setShowAddRecipesModal(true)}>
                            <Plus size={15} strokeWidth={2.5} style={{ marginRight: 5 }} />
                            Add Recipes
                        </button>
                    </div>

                    <CollectionRecipeGrid
                        recipes={recipes}
                        onViewRecipe={(recipeId) => navigate(`/recipe/${recipeId}`)}
                        onRemoveRecipe={handleRemoveRecipe}
                        onAddRecipes={() => setShowAddRecipesModal(true)}
                    />
                </div>
            </div>

            {showAddRecipesModal && (
                <AddRecipesModal
                    collectionId={Number(id)}
                    existingIds={existingRecipeIds}
                    onClose={() => setShowAddRecipesModal(false)}
                    onSaved={handleRecipesAdded}
                />
            )}

            {showEditModal && (
                <CollectionModal
                    mode="edit"
                    collection={collection}
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onSaved={(updatedCollection) => {
                        setCollection(updatedCollection);
                        setShowEditModal(false);
                    }}
                />
            )}
        </>
    );
};

export default withErrorBoundary(CollectionDetail);