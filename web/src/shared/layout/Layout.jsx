import { Outlet, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default Layout;