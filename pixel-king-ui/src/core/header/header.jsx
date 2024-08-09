import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import styles from './header.module.css';
import { Link } from 'react-router-dom';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        if (menuOpen) {
            setMenuOpen(false);
        } else {
            setMenuOpen(true);
        }
    };

    return (
        <header className={styles.header}>
            <Link to='/'>
                <div className={styles.header__logo_container}>
                    <img className={styles.header__logo} src={logo} alt="Pixel King"/>
                    <p className={styles.header_logo_text}>pixel king</p>
                </div>
            </Link>
            <nav>
                <ul className={styles.header__nav__list}>
                    <li><Link className={styles.header__link} to="/">Home</Link></li>
                    <li><Link className={styles.header__link} to="/license">License</Link></li>
                    <li><Link className={styles.header__link} to="/contact">Contact</Link></li>
                    <li><Link className={styles.header__link} to="/wallpapers">Wallpapers</Link></li>
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
                    </ul>
                </div>
            </div>
        </header>
    );
}
