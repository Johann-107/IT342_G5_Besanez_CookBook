import { Plus, Minus } from 'lucide-react';
import styles from '../../styles/CreateRecipe.module.css';

const UNITS = [
    { value: '', label: 'Unit', disabled: true },
    { value: 'G', label: 'g' }, { value: 'KG', label: 'kg' }, { value: 'ML', label: 'ml' },
    { value: 'L', label: 'L' }, { value: 'TSP', label: 'tsp' }, { value: 'TBSP', label: 'tbsp' },
    { value: 'CUP', label: 'cup' }, { value: 'FL_OZ', label: 'fl oz' }, { value: 'OZ', label: 'oz' },
    { value: 'LB', label: 'lb' }, { value: 'PIECE', label: 'piece' }, { value: 'PINCH', label: 'pinch' },
    { value: 'CLOVE', label: 'clove' }, { value: 'SLICE', label: 'slice' }, { value: 'OTHER', label: 'other' },
];

const IngredientList = ({ ingredients, onAdd, onUpdate, onRemove }) => {
    const showRemove = ingredients.length > 1;
    return (
        <section className={styles.formSection}>
            <div className={styles.sectionTitleRow}>
                <h3 className={styles.sectionTitle}>Ingredients</h3>
                <button type="button" className={styles.btnGhost} onClick={onAdd}>
                    <Plus size={14} /> Add Ingredient
                </button>
            </div>

            {ingredients.map((ing) => (
                <div key={ing._key} className={`${styles.ingredientRow} ${showRemove ? styles.hasRemove : ''}`}>
                    <input
                        className={styles.formInput}
                        type="number"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) => onUpdate(ing._key, 'quantity', e.target.value)}
                        style={{ maxWidth: 100 }}
                    />
                    <select
                        className={styles.formSelect}
                        value={ing.unit}
                        onChange={(e) => onUpdate(ing._key, 'unit', e.target.value)}
                        style={{ maxWidth: 100 }}
                    >
                        {UNITS.map(u => (<option key={u.value} value={u.value} disabled={u.disabled}>{u.label}</option>))}
                    </select>
                    <input
                        className={styles.formInput}
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={(e) => onUpdate(ing._key, 'name', e.target.value)}
                    />
                    <input
                        className={styles.formInput}
                        placeholder="Notes (optional)"
                        value={ing.notes}
                        onChange={(e) => onUpdate(ing._key, 'notes', e.target.value)}
                    />
                    {showRemove && (
                        <button type="button" className={styles.removeBtn} onClick={() => onRemove(ing._key)} aria-label="Remove ingredient">
                            <Minus size={14} />
                        </button>
                    )}
                </div>
            ))}
        </section>
    );
};

export default IngredientList;