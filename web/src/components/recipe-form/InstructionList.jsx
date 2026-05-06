import { Plus, Minus } from 'lucide-react';
import styles from '../../styles/CreateRecipe.module.css';

const InstructionList = ({ steps, onAdd, onUpdate, onRemove }) => {
    return (
        <section className={styles.formSection}>
            <div className={styles.sectionTitleRow}>
                <h3 className={styles.sectionTitle}>Instructions</h3>
                <button type="button" className={styles.btnGhost} onClick={onAdd}>
                    <Plus size={14} /> Add Step
                </button>
            </div>

            {steps.map((step, idx) => (
                <div key={step._key} className={styles.stepRow}>
                    <div className={styles.stepNum}>{idx + 1}</div>
                    <textarea
                        className={styles.stepTextarea}
                        placeholder={`Step ${idx + 1}…`}
                        value={step.description}
                        rows={2}
                        onChange={(e) => onUpdate(step._key, e.target.value)}
                    />
                    {steps.length > 1 && (
                        <button type="button" className={styles.removeBtn} onClick={() => onRemove(step._key)}>
                            <Minus size={14} />
                        </button>
                    )}
                </div>
            ))}
        </section>
    );
};

export default InstructionList;