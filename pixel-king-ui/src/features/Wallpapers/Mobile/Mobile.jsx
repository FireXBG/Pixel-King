import styles from './Mobile.module.css';
import blankImage from "../../../assets/pixel.king.co_Imagine_a_photograph_captured_from_an_aerial_pe_4dae4099-1069-45eb-bd04-f59cae10b70c_2-pixel_king-enhance-6x.png";

export default function Mobile({currentPage, imagesPerPage}) {
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