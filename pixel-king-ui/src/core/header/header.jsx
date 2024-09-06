// core/header/Header.js

import React, { useState, useContext } from 'react';
import logo from '../../assets/logo.png';
import pixelsImg from '../../assets/Diamond.png';
import styles from './header.module.css';
import { Link } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import PixelsContext from '../../context/pixelsContext'; // Use PixelsContext

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { pixels } = useContext(PixelsContext); // Access pixels from context
    const { isUserAuthenticated, userLogout } = useContext(AuthContext);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        userLogout();
        toggleMenu();
    };

    return (
        <header className={styles.header}>
            <div className={styles.header__left}>
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
                    </ul>
                </nav>
            </div>
            <nav>
                <ul className={styles.wallpapers_nav}>
                    <li className={styles.pixels__container}>
                        <p><img src={pixelsImg} alt="Pixels"/>{pixels}</p>
                    </li>
                    <li><Link className={`${styles.header__link} ${styles.header__special}`} to="/wallpapers">Wallpapers</Link></li>
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
                        <li><Link className={`${styles.mobile_link} ${styles.mobile_special}`} to="/wallpapers" onClick={toggleMenu}>Wallpapers</Link></li>
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
                                <li><Link className={styles.mobile_link} to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </header>
    );
}
