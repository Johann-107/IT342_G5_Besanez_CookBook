import { Outlet } from 'react-router-dom';
import Header from './Header';
import styles from '../../styles/Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;