import imgA from '../../../assets/A.png';
import imgB from '../../../assets/B.png';
import ReactCompareImage from 'react-compare-image';
import styles from './CompareImages.module.css';

export default function CompareImages() {
    return (
        <div className={styles.compare__main__container}>
            <div className={styles.details__container}>
                <h1 className={styles.compare__heading}>Experience the Difference<br/>8X Image Enhancements</h1>
                <p className={styles.compare__paragraph}>Transform your device with stunning 8X image enhancements.
                    Our
                    wallpapers are meticulously enhanced to deliver exceptional quality, boasting resolutions of up
                    to
                    8K. Elevate your visual experience with unparalleled clarity and detail.</p>
            </div>
            <div className={styles.compare__image__container}>
                <ReactCompareImage leftImage={imgB} rightImage={imgA}/>
            </div>
            <div className={styles.shadow1}></div>
            <div className={styles.shadow2}></div>
            <div className={styles.shadow3}></div>
        </div>
    );
}
