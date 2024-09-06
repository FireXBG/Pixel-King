import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Wallpapers.module.css';
import phoneIcon from '../../assets/phone.svg';
import desktopIcon from '../../assets/computer.svg';
import searchIcon from '../../assets/search_icon.png';
import Desktop from './Desktop/Desktop';
import Mobile from './Mobile/Mobile';
import WallpaperDetails from './WallpaperDetails/WallpaperDetails';
import AdComponent from '../../core/adComponent/adComponent';

export default function Wallpapers() {
    const [initialDeviceType] = useState(window.innerWidth < 768 ? 'mobile' : 'desktop');
    const [deviceType, setDeviceType] = useState(initialDeviceType);
    const [currentPage, setCurrentPage] = useState(1);
    const [wallpapers, setWallpapers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [free4kDownloads, setFree4kDownloads] = useState(0);
    const [free8kDownloads, setFree8kDownloads] = useState(0);
    const [selectedWallpaper, setSelectedWallpaper] = useState(null);
    const [imagesLoaded, setImagesLoaded] = useState(new Array(9).fill(false));
    const [userChangedDeviceType, setUserChangedDeviceType] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);
    const [userPlan, setUserPlan] = useState(null);
    const [userCredits, setUserCredits] = useState(100); // Initial credits, update based on API
    const imagesPerPage = 9;
    const cancelTokenSource = useRef(null);
    const debounceTimeout = useRef(null);
    const noResultsTimeout = useRef(null);

    useEffect(() => {
        fetchWallpapers(deviceType, currentPage, searchQuery, true);
    }, [deviceType, currentPage, searchQuery]);

    useEffect(() => {
        const handleResize = () => {
            if (!userChangedDeviceType) {
                const newDeviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';
                if (newDeviceType !== deviceType) {
                    setDeviceType(newDeviceType);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (cancelTokenSource.current) {
                cancelTokenSource.current.cancel('Component unmounted');
            }
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
            if (noResultsTimeout.current) {
                clearTimeout(noResultsTimeout.current);
            }
        };
    }, [deviceType, userChangedDeviceType]);

    useEffect(() => {
        const fetchUserPlan = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/account-details`, {
                    headers: {
                        Authorization: localStorage.getItem('userToken')
                    }
                });
                setUserPlan(response.data.plan);
                setUserCredits(response.data.credits);  // Fetch user credits from backend
            } catch (error) {
                console.error('Error fetching user plan:', error);
            }
        };

        fetchUserPlan();
    }, []);

    useEffect(() => {
        const getFreeDownloads = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/free-downloads`, {
                    headers: {
                        Authorization: localStorage.getItem('userToken')
                    }
                });
                setFree4kDownloads(response.data.DownloadsAvailable4K);
                setFree8kDownloads(response.data.DownloadsAvailable8K);
            } catch (error) {
                console.error('Error fetching free downloads:', error);
            }
        };

        getFreeDownloads();
    }, []);

    const fetchWallpapers = async (type, page, tags, reset = false) => {
        if (cancelTokenSource.current) {
            cancelTokenSource.current.cancel('Operation canceled due to new request.');
        }

        cancelTokenSource.current = axios.CancelToken.source();
        setImagesLoaded(new Array(imagesPerPage).fill(false));
        setShowNoResults(false);
        if (noResultsTimeout.current) {
            clearTimeout(noResultsTimeout.current);
        }

        try {
            let url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers?view=${type}&page=${page}&limit=${imagesPerPage}`;
            if (tags) {
                url += `&tags=${encodeURIComponent(tags.toLowerCase())}`;
            }
            const response = await axios.get(url, {
                cancelToken: cancelTokenSource.current.token,
            });
            const fetchedWallpapers = response.data.wallpapers;
            setTotalPages(Math.ceil(response.data.totalCount / imagesPerPage));

            if (reset) {
                setWallpapers(fetchedWallpapers);
            } else {
                setWallpapers((prevWallpapers) => [...prevWallpapers, ...fetchedWallpapers]);
            }

            const updatedImagesLoaded = new Array(imagesPerPage).fill(false);
            fetchedWallpapers.forEach((_, index) => {
                updatedImagesLoaded[index] = false;
            });
            setImagesLoaded(updatedImagesLoaded);

            if (fetchedWallpapers.length === 0) {
                noResultsTimeout.current = setTimeout(() => {
                    setShowNoResults(true);
                }, 3000);
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                console.error('Error fetching wallpapers:', error);
            }
        }
    };

    const setDeviceTypeHandler = (type) => {
        setDeviceType(type);
        setUserChangedDeviceType(true);
        setCurrentPage(1);
        setWallpapers([]);
        fetchWallpapers(type, 1, searchQuery, true);
        window.scrollTo(0, 0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setWallpapers([]);
        fetchWallpapers(deviceType, page, searchQuery, true);
        window.scrollTo(0, 0);
    };

    const handleSearch = () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            setCurrentPage(1);
            setWallpapers([]);
            fetchWallpapers(deviceType, 1, searchQuery, true);
        }, 300); // Debounce search by 300ms
    };

    const openWallpaperDetails = (wallpaper) => {
        setSelectedWallpaper(wallpaper);
    };

    const closeWallpaperDetails = () => {
        setSelectedWallpaper(null);
    };

    const handleDownloadSuccess = (costInPixels) => {
        // Deduct pixels immediately when a download is initiated
        setUserCredits(prevCredits => prevCredits - costInPixels);
    };

    const handleImageLoad = (index) => {
        setImagesLoaded((prev) => {
            const newImagesLoaded = [...prev];
            newImagesLoaded[index] = true;
            return newImagesLoaded;
        });
    };

    const allImagesLoaded = wallpapers.length === 0 || imagesLoaded.slice(0, wallpapers.length).every(Boolean);

    return (
        <>
            <div className={styles.search__container}>
                <div className={styles.search__wrapper}>
                    <input
                        className={styles.search}
                        placeholder="Search wallpapers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    <button className={styles.search__button} onClick={handleSearch}>
                        <img className={styles.search__icon} src={searchIcon} alt='search button' />
                    </button>
                </div>
                <div className={styles.device__type__container}>
                    <button
                        onClick={() => setDeviceTypeHandler('mobile')}
                        className={`${styles.device__type__btn} ${styles.mobile__btn}`}
                    >
                        <img className={styles.mobile__btn__img} src={phoneIcon} alt="mobile button"/>
                    </button>
                    <button
                        onClick={() => setDeviceTypeHandler('desktop')}
                        className={`${styles.device__type__btn} ${styles.desktop__btn}`}
                    >
                        <img className={styles.desktop__btn__img} src={desktopIcon} alt="desktop button"/>
                    </button>
                </div>
            </div>

            <section className={styles.wallpapersSection}>
                <div className={styles.wallpapersGrid}>
                    {deviceType === 'desktop' ? (
                        <Desktop wallpapers={wallpapers} onWallpaperClick={openWallpaperDetails} onImageLoad={handleImageLoad} imagesLoaded={imagesLoaded} />
                    ) : (
                        <Mobile wallpapers={wallpapers} onWallpaperClick={openWallpaperDetails} onImageLoad={handleImageLoad} imagesLoaded={imagesLoaded} />
                    )}
                </div>
            </section>
            {wallpapers.length > 0 && (
                <>
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
                    <AdComponent />
                </>
            )}

            {wallpapers.length === 0 && allImagesLoaded && showNoResults && (
                <div className={styles.noResults}>
                    No wallpapers found.
                </div>
            )}

            {selectedWallpaper && (
                <WallpaperDetails
                    wallpaper={selectedWallpaper}
                    free4kDownloads={free4kDownloads}
                    free8kDownloads={free8kDownloads}
                    userPlan={userPlan}
                    userCredits={userCredits}
                    onDownloadSuccess={handleDownloadSuccess} // Pass the handler to update pixels
                    onClose={closeWallpaperDetails}
                />
            )}
        </>
    );
}
