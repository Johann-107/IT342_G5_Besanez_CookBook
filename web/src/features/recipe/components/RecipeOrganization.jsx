import { FolderOpen } from 'lucide-react';
import styles from '../CreateRecipe.module.css';

const RecipeOrganization = ({ isPublic, onPublicChange, collections, selectedCollections, onToggleCollection, showCollections }) => (
    <section className={styles.formSection}>
        <h3 className={styles.sectionTitle}>
            <FolderOpen size={17} className={styles.inlineIcon} /> Organization
        </h3>
        <label className={styles.checkboxRow}>
            <input type="checkbox" checked={isPublic} onChange={(e) => onPublicChange(e.target.checked)} />
            <span>Make this recipe public</span>
        </label>

        {showCollections && (
            <div className={styles.formGroup} style={{ marginTop: 14 }}>
                <label className={styles.formLabel}>Add to Collections</label>
                <div className={styles.collectionsList}>
                    {collections.map(col => (
                        <label key={col.id} className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={selectedCollections.includes(col.id)}
                                onChange={() => onToggleCollection(col.id)}
                            />
                            <span>{col.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        )}
    </section>
);

export default RecipeOrganization;