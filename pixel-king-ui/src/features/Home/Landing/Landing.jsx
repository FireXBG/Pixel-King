import React, { useState, useEffect } from 'react';
import styles from './Landing.module.css';
import landingSideImages from '../../../assets/landing_images.png';
import landingSideImagesMobile from '../../../assets/landing_images_mobile.png';

export default function Landing() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            console.log('Window width:', window.innerWidth, 'isMobile:', window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        // Initial check
        handleResize();

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <section className={styles.landing__container}>
            <div className={styles.landing__shadow__1}></div>
            <h1 className={styles.landing__main__h1}>INSPIRE<br/>CREATE<br/>ADORN</h1>
            <img
                className={styles.landing_main_images}
                src={isMobile ? landingSideImagesMobile : landingSideImages}
                alt="Landing Side"
            />
        </section>
    );
}
