import styles from './Landing.module.css';

export default function Landing() {
    return (
        <section className={styles.landing__container}>
            <div className={styles.landing__shadow__1}></div>
            <div className={styles.landing__shadow__2}></div>
        </section>
    )
}