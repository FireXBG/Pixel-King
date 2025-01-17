import { Outlet, Link } from 'react-router-dom';
import styles from './AdminLayout.module.css';

function AdminLayout() {
    return (
        <>
            <header className={styles.header}>
                <nav>
                    <Link to='/admin/wallpapers'>Manage Wallpapers</Link>
                    <Link to='/admin/users'>Manage Users</Link>
                </nav>
            </header>
            <main className={styles.main__container}>
                <Outlet />
            </main>
        </>
    );
}

export default AdminLayout;
