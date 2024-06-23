import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManageWallpapers.module.css';
import UploadWallpaper from './UploadWallpaper/UploadWallpaper';

function ManageWallpapers() {
    const [uploadWallpapersMenu, setUploadWallpapersMenu] = useState(false);
    const [wallpapers, setWallpapers] = useState([]);
    const [deleting, setDeleting] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('desktop'); // Set default filter to 'desktop'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const imagesPerPage = 20;

    useEffect(() => {
        fetchWallpapers();
    }, [filter, currentPage]);

    const fetchWallpapers = async () => {
        setLoading(true);
        try {
            const url = `http://localhost:3001/admin/wallpapers?view=${filter}&page=${currentPage}&limit=${imagesPerPage}`;
            const response = await axios.get(url);
            const wallpapers = response.data.wallpapers || [];
            setWallpapers(wallpapers);
            setTotalPages(Math.ceil(response.data.totalCount / imagesPerPage));
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
            setError('Failed to fetch wallpapers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchWallpapers(); // Fetch the updated list of wallpapers
    };

    const handleDelete = async (wallpaperId) => {
        setDeleting((prev) => ({ ...prev, [wallpaperId]: true }));
        try {
            await axios.delete(`http://localhost:3001/admin/wallpapers/${wallpaperId}`);
            fetchWallpapers(); // Fetch the updated list of wallpapers
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
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

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
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {loading ? (
                <div className={styles.loaderContainer}>
                    <div className={styles.loader}></div>
                </div>
            ) : (
                <div className={styles.wallpapersGrid}>
                    {wallpapers.map((wallpaper) => (
                        <div key={wallpaper._id} className={styles.wallpaperItem}>
                            {wallpaper.thumbnailData && (
                                <img src={`data:${wallpaper.thumbnailContentType};base64,${wallpaper.thumbnailData}`} alt={wallpaper.name} className={styles.wallpaperImage} />
                            )}
                            <div className={styles.wallpaperActions}>
                                <button className='admin__button'>Edit</button>
                                <div className={styles.actionButtonContainer}>
                                    {deleting[wallpaper._id] ? (
                                        <div className={styles.loader}></div>
                                    ) : (
                                        <button className='admin__button' onClick={() => handleDelete(wallpaper._id)}>Delete</button>
                                    )}
                                </div>
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
        </div>
    );
}

export default ManageWallpapers;
