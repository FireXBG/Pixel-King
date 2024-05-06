import styles from './Desktop.module.css';
import blankImage from '../../../assets/pixel.king.co_Imagine_random_--ar_169_--v_6_95cb62e1-5d76-4ba3-b63b-b1d17cf538e6_0-topaz-enhance-6x.png'

export default function Desktop() {
    return (
        <div className={styles.images__container}>
            <div className={styles.images__container}>
                {Array(30).fill().map((_, i) => (
                    <img className={styles.image} key={i} src={blankImage} alt={`image ${i}`}/>
                ))}
            </div>
        </div>
    )
}