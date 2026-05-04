import styles from '../../styles/AdminDashboard.module.css';

const RecentTable = ({ title, rows, columns, renderRow }) => (
    <div className={styles.tableCard}>
        <div className={styles.tableCardTitle}>{title}</div>
        <table className={styles.table}>
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col} className={styles.th}>
                            {col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className={styles.tr}>
                        {renderRow(row)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default RecentTable;