import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ManageWallpapers.module.css';
import UploadWallpaper from './UploadWallpaper/UploadWallpaper';

function ManageWallpapers() {
    const [uploadWallpapersMenu, setUploadWallpapersMenu] = useState(false);
    const [wallpapers, setWallpapers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWallpapers();
    }, []);

    const fetchWallpapers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/admin/wallpapers');
            setWallpapers(response.data);
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
            setError('Failed to fetch wallpapers. Please try again later.');
        }
    };

    const handleUploadSuccess = () => {
        setUploadWallpapersMenu(false); // Close the upload menu
        fetchWallpapers(); // Fetch the updated list of wallpapers
    };

    const handleDelete = async (wallpaperId) => {
        try {
            await axios.delete(`http://localhost:3001/admin/wallpapers/${wallpaperId}`);
            fetchWallpapers(); // Fetch the updated list of wallpapers
        } catch (error) {
            console.error('Error deleting wallpaper:', error);
            alert('Failed to delete wallpaper');
        }
    };

    const toggleUploadMenu = () => {
        setUploadWallpapersMenu(!uploadWallpapersMenu);
    };

    return (
        <div className={styles.manageWallpapersContainer}>
            <button className='admin__button' onClick={toggleUploadMenu}>Upload Wallpapers</button>
            {uploadWallpapersMenu && <UploadWallpaper onSuccess={handleUploadSuccess} />}

            {error && <div className="error-message">{error}</div>}

            <div className={styles.wallpapersGrid}>
                {wallpapers.map((wallpaper) => (
                    <div key={wallpaper._id} className={styles.wallpaperItem}>
                        {/* Display thumbnail using base64 data */}
                        {wallpaper.thumbnailData && (
                            <img src={`data:${wallpaper.thumbnailContentType};base64,${wallpaper.thumbnailData}`} alt={wallpaper.name} className={styles.wallpaperImage} />
                        )}
                        <div className={styles.wallpaperActions}>
                            <button className='admin__button'>Edit</button>
                            <button className='admin__button' onClick={() => handleDelete(wallpaper._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ManageWallpapers;
