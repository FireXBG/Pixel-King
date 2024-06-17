import styles from './Desktop.module.css';
import blankImage from '../../../assets/pixel.king.co_Imagine_random_--ar_169_--v_6_95cb62e1-5d76-4ba3-b63b-b1d17cf538e6_0-topaz-enhance-6x.png'

export default function Desktop({currentPage, imagesPerPage}) {
    const totalImages = 30;
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, totalImages);
    const images = Array(totalImages).fill().slice(startIndex, endIndex);

    return (
        <div className={styles.images__container}>
            {images.map((_, i) => (
                <img className={styles.image} key={i} src={blankImage} alt={`image ${startIndex + i}`}/>
            ))}
        </div>
    )
}