import { useState, useEffect, useRef } from 'react';
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
    const [fadeClass, setFadeClass] = useState(''); // Start with no fade class
    const imagesPerPage = 20;
    const cancelTokenSource = useRef(null);

    useEffect(() => {
        fetchWallpapers(deviceType, currentPage, searchQuery, true, true);
    }, [deviceType, currentPage, searchQuery]);

    const fetchWallpapers = async (type, page, tags, reset = false, initialFetch = false) => {
        if (loading) return;

        setLoading(true);
        if (reset) {
            setWallpapers([]);
        }

        if (cancelTokenSource.current) {
            cancelTokenSource.current.cancel('Operation canceled due to new request.');
        }

        cancelTokenSource.current = axios.CancelToken.source();

        try {
            let url = `${process.env.REACT_APP_BACKEND_URL}/admin/wallpapers?view=${type}&page=${page}&limit=${imagesPerPage}`;
            console.log(process.env.REACT_APP_BACKEND_URL)
            if (tags) {
                url += `&tags=${tags}`;
            }
            console.log(`Requesting wallpapers for view: ${type}, page: ${page}, limit: ${imagesPerPage}, tags: ${tags}`);
            const response = await axios.get(url, {
                cancelToken: cancelTokenSource.current.token,
            });
            console.log(`Received response: `, response.data);
            const fetchedWallpapers = response.data.wallpapers;
            setTotalPages(Math.ceil(response.data.totalCount / imagesPerPage));
            console.log(`Total pages: ${Math.ceil(response.data.totalCount / imagesPerPage)}`);

            if (reset) {
                setWallpapers([]);
            }

            if (initialFetch) {
                setWallpapers(fetchedWallpapers);
                setFadeClass('fade-in');
                setLoading(false);
            } else {
                setFadeClass('fade-out');

                setTimeout(() => {
                    setWallpapers(fetchedWallpapers);
                    setFadeClass('fade-in');
                    setLoading(false);
                }, 500);
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                console.error('Error fetching wallpapers:', error);
                setLoading(false);
            }
        }
    };

    const setDeviceTypeHandler = (type) => {
        if (loading) return;
        setFadeClass('fade-out');
        setTimeout(() => {
            setDeviceType(type);
            setCurrentPage(1);
            fetchWallpapers(type, 1, searchQuery, true, true);
            window.scrollTo(0, 0);
        }, 500);
    };

    const handlePageChange = (page) => {
        setFadeClass('fade-out');
        setTimeout(() => {
            setCurrentPage(page);
            fetchWallpapers(deviceType, page, searchQuery, true);
            window.scrollTo(0, 0);
        }, 500);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setWallpapers([]); // Clear current wallpapers when search query changes
        fetchWallpapers(deviceType, 1, searchQuery, true);
    };

    const openWallpaperDetails = (wallpaper) => {
        setSelectedWallpaper(wallpaper);
        console.log(`Selected wallpaper ID: ${wallpaper._id}`);
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
                        disabled={loading} // Disable button while loading
                    >
                        <img className={styles.mobile__btn__img} src={phoneIcon} alt='mobile button' />
                    </button>
                    <button
                        onClick={() => setDeviceTypeHandler('desktop')}
                        className={`${styles.device__type__btn} ${styles.desktop__btn}`}
                        disabled={loading} // Disable button while loading
                    >
                        <img className={styles.desktop__btn__img} src={desktopIcon} alt='desktop button' />
                    </button>
                </div>
            </div>
            <section className={styles.wallpapersSection}>
                {loading && (
                    <div className={styles.loaderContainer}>
                        <div className={styles.loader}></div>
                    </div>
                )}
                <div className={`${styles.wallpapersGrid} ${styles[fadeClass]}`}>
                    {deviceType === 'desktop' ? (
                        <Desktop currentPage={currentPage} imagesPerPage={imagesPerPage} wallpapers={wallpapers} onWallpaperClick={openWallpaperDetails} />
                    ) : (
                        <Mobile currentPage={currentPage} imagesPerPage={imagesPerPage} wallpapers={wallpapers} onWallpaperClick={openWallpaperDetails} />
                    )}
                </div>
            </section>
            {!loading && wallpapers.length > 0 && (
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
            )}
            {selectedWallpaper && <WallpaperDetails wallpaper={selectedWallpaper} onClose={closeWallpaperDetails} />}
        </>
    );
}
