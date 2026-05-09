import styles from '../AdminDashboard.module.css';

const MiniChart = ({ title, data, color, total, totalLabel }) => {
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    return (
        <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
                <div className={styles.chartTitle}>{title}</div>
                <div className={styles.chartTotal} style={{ color }}>
                    <strong>{total}</strong> {totalLabel}
                </div>
            </div>
            <div className={styles.barChart}>
                {data.map((point, i) => (
                    <div key={i} className={styles.barWrap} title={`${point.date}: ${point.count}`}>
                        <div
                            className={styles.bar}
                            style={{
                                height: `${Math.max(
                                    (point.count / maxCount) * 100,
                                    point.count > 0 ? 8 : 2
                                )}%`,
                                background: point.count > 0 ? color : '#EDD8C4',
                                opacity: point.count > 0 ? 0.75 + (i / data.length) * 0.25 : 0.3,
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.chartXLabels}>
                <span>30d ago</span>
                <span>15d ago</span>
                <span>Today</span>
            </div>
        </div>
    );
};

export default MiniChart;