import styles from './GetStarted.module.css';
import img from '../../../assets/landing_get_started.png';
import { Link } from 'react-router-dom';

export default function () {
    return (
        <section className={styles.about__section}>
            <div className={styles.about__container}>
                <h1 className={styles.about__h1}>GET STARTED</h1>
            </div>
            <img className={styles.about__img} src={img}/>
            <Link to="/wallpapers" className={styles.about__btn}>Explore Wallpapers</Link>
        </section>
    )
}