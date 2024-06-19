import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManageWallpapers.module.css';
import UploadWallpaper from './UploadWallpaper/UploadWallpaper';

function ManageWallpapers() {
    const [uploadWallpapersMenu, setUploadWallpapersMenu] = useState(false);
    const [wallpapers, setWallpapers] = useState([]);
    const [deleting, setDeleting] = useState({});
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWallpapers();
    }, []);

    const fetchWallpapers = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.get('http://localhost:3001/admin/wallpapers');
            setWallpapers(response.data);
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
            setError('Failed to fetch wallpapers. Please try again later.');
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    const handleUploadSuccess = () => {
        setUploadWallpapersMenu(false); // Close the upload menu
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

    return (
        <div className={styles.manageWallpapersContainer}>
            <button className='admin__button' onClick={toggleUploadMenu}>Upload Wallpapers</button>
            {uploadWallpapersMenu && <UploadWallpaper onSuccess={handleUploadSuccess} />}

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
        </div>
    );
}

export default ManageWallpapers;
