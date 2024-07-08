import styles from './footer.module.css';
import logo from '../../assets/logo.png';
import {Link} from "react-router-dom";
import React from "react";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <img src={logo} className={styles.footer__image}/>
            <div>
                <ul className={styles.footer__nav__list}>
                    <li><Link className={styles.footer__link} to="/">Home</Link></li>
                    <li><Link className={styles.footer__link} to="/license">License</Link></li>
                    <li><Link className={styles.footer__link} to="/contact">Contact</Link></li>
                    <li><Link className={styles.footer__link} to="/wallpapers">Wallpapers</Link></li>
                </ul>
            </div>
            <div>
                <ul className={styles.footer__nav__list}>
                    <li><Link className={styles.footer__link} to="/privacy">Privacy Policy</Link></li>
                    <li><Link className={styles.footer__link} to="/license">License</Link></li>
                </ul>
            </div>
        </footer>
    )
}