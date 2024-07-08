import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManageWallpapers.module.css';
import UploadWallpaper from './UploadWallpaper/UploadWallpaper';
import EditTagsModal from './EditTagsModal/EditTagsModal';

function ManageWallpapers() {
    const [uploadWallpapersMenu, setUploadWallpapersMenu] = useState(false);
    const [wallpapers, setWallpapers] = useState([]);
    const [deleting, setDeleting] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('desktop');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingWallpaper, setEditingWallpaper] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const imagesPerPage = 20;

    useEffect(() => {
        fetchWallpapers();
    }, [filter, currentPage]);

    const fetchWallpapers = async () => {
        setLoading(true);
        setImagesLoaded(0); // Reset image loading count
        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers?view=${filter}&page=${currentPage}&limit=${imagesPerPage}`;
            const response = await axios.get(url);
            const wallpapers = response.data.wallpapers || [];
            setWallpapers(wallpapers);
            setTotalPages(Math.ceil(response.data.totalCount / imagesPerPage));
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
            setError('Failed to fetch wallpapers. Please try again later.');
            setLoading(false); // Stop loading if there's an error
        }
    };

    const handleUploadSuccess = () => {
        fetchWallpapers();
    };

    const handleDelete = async (wallpaperId) => {
        setDeleting((prev) => ({ ...prev, [wallpaperId]: true }));
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaperId}`);
            fetchWallpapers();
        } catch (error) {
            console.error('Error deleting wallpaper:', error);
            alert('Failed to delete wallpaper');
        } finally {
            setDeleting((prev) => ({ ...prev, [wallpaperId]: false }));
        }
    };

    const toggleUploadMenu = () => {
        setUploadWallpapersMenu(!uploadWallpapersMenu);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleEdit = (wallpaper) => {
        setEditingWallpaper(wallpaper);
    };

    const handleSaveTags = async (wallpaperId, newTags, newIsPaid) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaperId}`, {
                tags: newTags,
                isPaid: newIsPaid
            });
            fetchWallpapers();
        } catch (error) {
            console.error('Error saving tags:', error);
            alert('Failed to save tags');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) {
            fetchWallpapers();
            return;
        }

        setLoading(true);
        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers?view=${filter}&id=${searchQuery}`;
            const response = await axios.get(url);
            const wallpapers = response.data.wallpapers || [];
            setWallpapers(wallpapers);
            setTotalPages(1);
        } catch (error) {
            console.error('Error searching wallpaper by ID:', error);
            setError('Failed to search wallpaper. Please try again later.');
            setLoading(false); // Stop loading if there's an error
        }
    };

    const handleImageLoad = () => {
        setImagesLoaded(prev => prev + 1);
    };

    useEffect(() => {
        if (imagesLoaded === wallpapers.length) {
            setLoading(false); // Stop loading when all images are loaded
        }
    }, [imagesLoaded, wallpapers.length]);

    return (
        <div className={styles.manageWallpapersContainer}>
            <button className='admin__button' onClick={toggleUploadMenu}>Upload Wallpapers</button>
            {uploadWallpapersMenu && <UploadWallpaper onSuccess={handleUploadSuccess} />}

            <div className={styles.filterContainer}>
                <label htmlFor="filter">Filter: </label>
                <select id="filter" value={filter} onChange={handleFilterChange}>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                </select>
                <input
                    type="text"
                    className={styles.search}
                    placeholder="Search by ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={styles.submit__button} onClick={handleSearch}>Search</button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {loading ? (
                <div className={styles.loaderContainer}>
                    <div className={styles.loader}></div>
                </div>
            ) : (
                <div className={`${styles.wallpapersGrid} ${styles.fadeIn}`}>
                    {wallpapers.map((wallpaper) => (
                        <div key={wallpaper._id} className={styles.wallpaperItem}>
                            {wallpaper.driveID_HD && (
                                <img
                                    src={`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.driveID_HD}`}
                                    alt={wallpaper.name}
                                    className={styles.wallpaperImage}
                                    onLoad={handleImageLoad}
                                />
                            )}
                            <div className={styles.wallpaperActions}>
                                <button className='admin__button' onClick={() => handleEdit(wallpaper)}>Edit</button>
                                <div className={styles.actionButtonContainer}>
                                    {deleting[wallpaper._id] ? (
                                        <div className={styles.loader}></div>
                                    ) : (
                                        <button className='admin__button'
                                                onClick={() => handleDelete(wallpaper._id)}>Delete</button>
                                    )}
                                </div>
                            </div>
                            <div>
                                {wallpaper.isPaid ? 'Paid' : 'Free'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

            {editingWallpaper && (
                <EditTagsModal
                    wallpaper={editingWallpaper}
                    onClose={() => setEditingWallpaper(null)}
                    onSave={handleSaveTags}
                />
            )}
        </div>
    );
}

export default ManageWallpapers;
