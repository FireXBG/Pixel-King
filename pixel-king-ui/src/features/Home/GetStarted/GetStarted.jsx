import { Link } from 'react-router-dom';
import styles from './GetStarted.module.css';
import img from '../../../assets/landing_get_started.png';

export default function GetStarted() {
    const handleClick = () => {
        window.scrollTo(0, 0);  // Scroll to the top
    };

    return (
        <section className={styles.about__section}>
            <div className={styles.about__container}>
                <h1 className={styles.about__h1}>GET STARTED</h1>
            </div>
            <img className={styles.about__img} src={img} alt="Get Started"/>
            <Link
                to="/wallpapers"
                className={styles.about__btn}
                onClick={handleClick}
            >
                Explore Wallpapers
            </Link>
        </section>
    );
}
