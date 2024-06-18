import styles from './ManageWallpapers.module.css';
import UploadWallpaper from './UploadWallpaper/UploadWallpaper';
import { useState, useEffect } from 'react';
import axios from 'axios';

function ManageWallpapers() {
    const [uploadWallpapersMenu, setUploadWallpapersMenu] = useState(false);
    const [wallpapers, setWallpapers] = useState([]);

    useEffect(() => {
        fetchWallpapers();
    }, []);

    const fetchWallpapers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/admin/wallpapers');
            setWallpapers(response.data);
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
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

            <div className={styles.wallpapersGrid}>
                {wallpapers.map((wallpaper) => (
                    <div key={wallpaper._id} className={styles.wallpaperItem}>
                        <img src={`http://localhost:3001/admin/wallpapers/${wallpaper.driveID}`} alt={wallpaper.name} className={styles.wallpaperImage} />
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
