import styles from './LoadingScreen.module.css';

const LoadingScreen = ({
    icon,
    message = 'Loading…',
    fullPage = true,
}) => {
    return (
        <div className={`${styles.wrap} ${fullPage ? styles.fullPage : styles.inline}`}>
            <div className={styles.iconWrap}>
                {icon}
            </div>
            <p className={styles.message}>{message}</p>
            <div className={styles.dots}>
                <span /><span /><span />
            </div>
        </div>
    );
};

export default LoadingScreen;