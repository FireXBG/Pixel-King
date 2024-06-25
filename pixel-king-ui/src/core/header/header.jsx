import logo from '../../assets/logo.png';
import styles from './header.module.css';
import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.header__logo_container}>
                <img className={styles.header__logo} src={logo} alt="Pixel King" />
                <p className={styles.header_logo_text}>pixel king</p>
            </div>
            <nav>
                <ul className={styles.header__nav__list}>
                    <li><Link className={styles.header__link} to="/">Home</Link></li>
                    <li><Link className={styles.header__link} to="/wallpapers">Wallpapers</Link></li>
                    <li><Link className={styles.header__link} to="/about">About</Link></li>
                    <li><Link className={styles.header__link} to="/license">License</Link></li>
                    <li><Link className={styles.header__link} to="/contact">Contact</Link></li>
                </ul>
            </nav>
        </header>
    )
}