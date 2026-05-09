import styles from '../AdminDashboard.module.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className={styles.pagination}>
            <button
                className={styles.pageBtn}
                onClick={() => onPageChange((p) => p - 1)}
                disabled={page === 0}
            >
                ← Prev
            </button>
            <span className={styles.pageInfo}>
                Page {page + 1} of {totalPages}
            </span>
            <button
                className={styles.pageBtn}
                onClick={() => onPageChange((p) => p + 1)}
                disabled={page >= totalPages - 1}
            >
                Next →
            </button>
        </div>
    );
};

export default Pagination;