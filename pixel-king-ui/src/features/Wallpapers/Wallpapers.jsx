import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Wallpapers.module.css';
import phoneIcon from '../../assets/phone.svg';
import desktopIcon from '../../assets/computer.svg';
import Desktop from './Desktop/Desktop';
import Mobile from './Mobile/Mobile';

export default function Wallpapers() {
    const [deviceType, setDeviceType] = useState('desktop');
    const [currentPage, setCurrentPage] = useState(1);
    const [wallpapers, setWallpapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const imagesPerPage = 20;

    useEffect(() => {
        fetchWallpapers(deviceType);
    }, [deviceType]);

    useEffect(() => {
        fetchWallpapers(deviceType);
    }, []);

    const fetchWallpapers = async (type) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/admin/wallpapers?view=${type}`);
            setWallpapers(response.data);
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
        } finally {
            setLoading(false);
        }
    };

    function setDeviceTypeHandler(type) {
        setDeviceType(type);
        setCurrentPage(1);
    }

    function handlePageChange(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }

    return (
        <>
            <div className={styles.search__container}>
                <input className={styles.search} placeholder='Example: Sci-Fi spaceships war' />
                <button className={styles.submit__button}>Search</button>
                <div className={styles.device__type__container}>
                    <button
                        onClick={() => setDeviceTypeHandler('mobile')}
                        className={`${styles.device__type__btn} ${styles.mobile__btn}`}
                    >
                        <img className={styles.mobile__btn__img} src={phoneIcon} alt='mobile button' />
                    </button>
                    <button
                        onClick={() => setDeviceTypeHandler('desktop')}
                        className={`${styles.device__type__btn} ${styles.desktop__btn}`}
                    >
                        <img className={styles.desktop__btn__img} src={desktopIcon} alt='desktop button' />
                    </button>
                </div>
            </div>
            <section className={styles.wallpapersSection}>
                {loading ? (
                    <div className={styles.loaderContainer}>
                        <div className={styles.loader}></div>
                    </div>
                ) : (
                    deviceType === 'desktop' ? (
                        <Desktop currentPage={currentPage} imagesPerPage={imagesPerPage} wallpapers={wallpapers} />
                    ) : (
                        <Mobile currentPage={currentPage} imagesPerPage={imagesPerPage} wallpapers={wallpapers} />
                    )
                )}
            </section>
            <div className={styles.pagination}>
                <button
                    disabled={currentPage === 1}
                    className={styles.page__btn}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </button>
                <span>{currentPage}</span>
                <button
                    className={styles.page__btn}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </>
    );
}
