import { Outlet } from 'react-router-dom';
import styles from '../../styles/Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;