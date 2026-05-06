import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import CollectionImageSlideshow from './CollectionImageSlideshow';
import styles from '../../styles/CollectionDetail.module.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });
};

const CollectionHero = ({ collection, recipeCount, colorGradient, hasCover, onBack, onEdit, onDelete }) => {
    const hasRecipeImages = !hasCover && (collection.recipeImages?.length > 0);

    // colorGradient is always the base style — acts as a loading placeholder
    // when the slideshow is active, and as the real background when there's nothing else
    const heroStyle = hasCover
        ? {
            backgroundImage: `linear-gradient(to bottom, rgba(92,61,46,0.45) 0%, rgba(58,42,30,0.72) 100%), url(${collection.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : { background: colorGradient };

    return (
        <div
            className={`${styles.hero} ${(hasCover || hasRecipeImages) ? styles.heroWithImage : ''}`}
            style={heroStyle}
        >
            {/* Recipe image slideshow — only when no explicit cover photo */}
            {hasRecipeImages && (
                <CollectionImageSlideshow
                    images={collection.recipeImages}
                    overlayVariant="strong"
                />
            )}

            {/* All text content sits above the slideshow (z-index: 4) */}
            <div className={styles.heroContentWrap}>
                <button className={styles.backBtn} onClick={onBack}>
                    <ArrowLeft size={15} strokeWidth={2} style={{ marginRight: 5 }} />
                    Collections
                </button>

                <div className={styles.heroContent}>
                    <div className={styles.heroLeft}>
                        {/* Only show emoji when there's truly no visual */}
                        {!hasCover && !hasRecipeImages && (
                            <div className={styles.collectionEmoji}>📂</div>
                        )}
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
        </div>
    );
};

export default CollectionHero;