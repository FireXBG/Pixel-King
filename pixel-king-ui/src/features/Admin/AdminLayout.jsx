import { Outlet, Link, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

function AdminLayout() {
    const navigate = useNavigate();

    const handleExit = () => {
        localStorage.removeItem('token');

        navigate('/wallpapers');
    };

    return (
        <>
            <header className={styles.header}>
                <nav>
                    <Link to='/admin/wallpapers' className={styles.navButton}>Wallpapers</Link>
                    <Link to='/admin/emails' className={styles.navButton}>Admin Emails</Link>
                    <Link to='/admin/adminUsers' className={styles.navButton}>Admin Users</Link>
                    <Link to='/admin/users' className={styles.navButton}>App Users</Link>
                    <Link to='/admin/promoCodes' className={styles.navButton}>Promo Codes</Link>
                    <button onClick={handleExit} className={`${styles.navButton} ${styles.exitButton}`}>
                        Exit
                    </button>
                </nav>
            </header>
            <main className={styles.main__container}>
                <Outlet />
            </main>
        </>
    );
}

export default AdminLayout;
