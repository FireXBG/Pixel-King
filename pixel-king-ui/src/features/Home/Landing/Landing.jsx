import styles from './Landing.module.css';
import landingSideImages from '../../../assets/landing_images.png'

export default function Landing() {
    return (
        <section className={styles.landing__container}>å
                <div className={styles.landing__shadow__1}></div>
                <div className={styles.landing__shadow__2}></div>
            <h1 className={styles.landing__main__h1}>INSPIRE<br/>CREATE<br/>ADORN</h1>
            <img className={styles.landing_main_images} src={landingSideImages} />
        </section>
    )
}