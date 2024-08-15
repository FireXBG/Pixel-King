import React, { useState, useContext, useEffect } from 'react';
import logo from '../../assets/logo.png';
import styles from './header.module.css';
import { Link } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext'; // Import the AuthContext

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isUserAuthenticated, userLogout } = useContext(AuthContext); // Use isUserAuthenticated instead of isAuthenticated

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        userLogout();
        toggleMenu(); // Close the mobile menu after logout
    };

    return (
        <header className={styles.header}>
            <Link to='/'>
                <div className={styles.header__logo_container}>
                    <img className={styles.header__logo} src={logo} alt="Pixel King" />
                    <p className={styles.header_logo_text}>pixel king</p>
                </div>
            </Link>
            <nav>
                <ul className={styles.header__nav__list}>
                    <li><Link className={styles.header__link} to="/">Home</Link></li>
                    <li><Link className={styles.header__link} to="/upgrade">Premium</Link></li>
                    <li><Link className={styles.header__link} to="/contact">Contact</Link></li>
                    {isUserAuthenticated ? (
                        <>
                            <li><Link className={styles.header__link} to="/account">Account</Link></li>
                            <li><span className={styles.header__link} onClick={handleLogout}>Logout</span></li>
                        </>
                    ) : (
                        <>
                            <li><Link className={styles.header__link} to="/login">Login</Link></li>
                            <li><Link className={styles.header__link} to="/register">Register</Link></li>
                        </>
                    )}
                    <li><Link className={styles.header__link} to="/wallpapers">Wallpapers</Link></li> {/* Wallpapers moved to last */}
                </ul>
            </nav>
            <div className={styles.mobile_nav}>
                <div className={styles.burger} onClick={toggleMenu}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div className={`${styles.mobile_menu} ${menuOpen ? styles.open : ''}`}>
                    <div className={styles.close} onClick={toggleMenu}>&times;</div>
                    <ul className={styles.mobile_menu_list}>
                        <li><Link className={styles.mobile_link} to="/" onClick={toggleMenu}>Home</Link></li>
                        <li><Link className={styles.mobile_link} to="/wallpapers" onClick={toggleMenu}>Wallpapers</Link></li>
                        <li><Link className={styles.mobile_link} to="/license" onClick={toggleMenu}>License</Link></li>
                        <li><Link className={styles.mobile_link} to="/contact" onClick={toggleMenu}>Contact</Link></li>
                        {isUserAuthenticated ? (
                            <>
                                <li><Link className={styles.mobile_link} to="/account" onClick={toggleMenu}>Account</Link></li>
                                <li><span className={styles.mobile_link} onClick={handleLogout}>Logout</span></li>
                            </>
                        ) : (
                            <>
                                <li><Link className={styles.mobile_link} to="/login" onClick={toggleMenu}>Login</Link></li>
                                <li><Link className={styles.mobile_link} to="/register" onClick={toggleMenu}>Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </header>
    );
}
