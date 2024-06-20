import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Wallpapers.module.css';
import phoneIcon from '../../assets/phone.svg';
import desktopIcon from '../../assets/computer.svg';
import Desktop from './Desktop/Desktop';
import Mobile from './Mobile/Mobile';
import WallpaperDetails from './WallpaperDetails/WallpaperDetails';

export default function Wallpapers() {
    const [deviceType, setDeviceType] = useState('desktop');
    const [currentPage, setCurrentPage] = useState(1);
    const [wallpapers, setWallpapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWallpaper, setSelectedWallpaper] = useState(null);
    const imagesPerPage = 20;

    useEffect(() => {
        fetchWallpapers(deviceType, currentPage, searchQuery);
    }, [deviceType, currentPage]);

    const fetchWallpapers = async (type, page, tags) => {
        setLoading(true);
        try {
            let url = `http://localhost:3001/admin/wallpapers?view=${type}&page=${page}&limit=${imagesPerPage}`;
            if (tags) {
                url += `&tags=${tags}`;
            }
            console.log(`Fetching wallpapers for view: ${type}, page: ${page}, limit: ${imagesPerPage}, tags: ${tags}`);
            const response = await axios.get(url);
            console.log(`Fetched ${type} wallpapers:`, response.data.wallpapers);
            setWallpapers(response.data.wallpapers);
            setTotalPages(Math.ceil(response.data.totalCount / imagesPerPage));
            console.log(`Total pages: ${Math.ceil(response.data.totalCount / imagesPerPage)}`);
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
        } finally {
            setLoading(false);
        }
    };

    function setDeviceTypeHandler(type) {
        setDeviceType(type);
        setCurrentPage(1);
        fetchWallpapers(type, 1, searchQuery); // Ensure fetch on device type change
    }

    function handlePageChange(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }

    const handleSearch = () => {
        setCurrentPage(1);
        fetchWallpapers(deviceType, 1, searchQuery);
    };

    const openWallpaperDetails = (wallpaper) => {
        setSelectedWallpaper(wallpaper);
    };

    const closeWallpaperDetails = () => {
        setSelectedWallpaper(null);
    };

    return (
        <>
            <div className={styles.search__container}>
                <input
                    className={styles.search}
                    placeholder='Example: Sci-Fi spaceships war'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={styles.submit__button} onClick={handleSearch}>Search</button>
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
                    <>
                        {deviceType === 'desktop' ? (
                            <Desktop currentPage={currentPage} imagesPerPage={imagesPerPage} wallpapers={wallpapers} onWallpaperClick={openWallpaperDetails} />
                        ) : (
                            <Mobile currentPage={currentPage} imagesPerPage={imagesPerPage} wallpapers={wallpapers} onWallpaperClick={openWallpaperDetails} />
                        )}
                    </>
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
                    disabled={currentPage >= totalPages}
                    className={styles.page__btn}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>
            {selectedWallpaper && <WallpaperDetails wallpaper={selectedWallpaper} onClose={closeWallpaperDetails} />}
        </>
    );
}
