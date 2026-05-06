import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import styles from '../../styles/CollectionDetail.module.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });
};

const CollectionHero = ({ collection, recipeCount, colorGradient, hasCover, onBack, onEdit, onDelete }) => {
    const heroStyle = hasCover
        ? {
            backgroundImage: `linear-gradient(to bottom, rgba(92,61,46,0.45) 0%, rgba(58,42,30,0.72) 100%), url(${collection.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : { background: colorGradient };

    return (
        <div className={`${styles.hero} ${hasCover ? styles.heroWithImage : ''}`} style={heroStyle}>
            <button className={styles.backBtn} onClick={onBack}>
                <ArrowLeft size={15} strokeWidth={2} style={{ marginRight: 5 }} />
                Collections
            </button>
            <div className={styles.heroContent}>
                <div className={styles.heroLeft}>
                    {!hasCover && <div className={styles.collectionEmoji}>📂</div>}
                    <h1 className={styles.collectionTitle}>{collection.name}</h1>
                    {collection.description && (
                        <p className={styles.collectionDesc}>{collection.description}</p>
                    )}
                    <div className={styles.heroBadges}>
                        <span className={styles.badge}>
                            {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
                        </span>
                        {collection.createdAt && (
                            <span className={styles.badge}>
                                Created {formatDate(collection.createdAt)}
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.heroActions}>
                    <button className={styles.btnHeroEdit} onClick={onEdit}>
                        <Pencil size={14} strokeWidth={2} style={{ marginRight: 5 }} />
                        Edit
                    </button>
                    <button className={styles.btnHeroDanger} onClick={onDelete}>
                        <Trash2 size={14} strokeWidth={2} style={{ marginRight: 5 }} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollectionHero;