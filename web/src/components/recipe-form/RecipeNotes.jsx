import { NotebookPen } from 'lucide-react';
import styles from '../../styles/CreateRecipe.module.css';

const RecipeNotes = ({ value, onChange }) => (
    <section className={styles.formSection}>
        <h3 className={styles.sectionTitle}>
            <NotebookPen size={17} className={styles.inlineIcon} /> Additional Notes
        </h3>
        <div className={styles.formGroup}>
            <textarea
                className={styles.formTextarea}
                placeholder="Tips, variations, serving suggestions…"
                value={value}
                rows={4}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </section>
);

export default RecipeNotes;