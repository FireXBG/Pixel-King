import React, { useState, useEffect } from 'react';
import styles from './Desktop.module.css';

export default function Desktop({ wallpapers, onWallpaperClick }) {
    const [loadedImages, setLoadedImages] = useState([]);

    useEffect(() => {
        setLoadedImages(new Array(wallpapers.length).fill(false));
    }, [wallpapers]);

    const handleImageLoad = (index) => {
        const newLoadedImages = [...loadedImages];
        newLoadedImages[index] = true;
        setLoadedImages(newLoadedImages);
    };

    return (
        <div className={styles.images__container}>
            {wallpapers.map((wallpaper, index) => (
                <div key={wallpaper._id} className={`${styles.imageWrapper} ${loadedImages[index] ? styles.fadeInPopUp : ''}`}>
                    <img
                        className={styles.image}
                        src={`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.driveID_HD}`}
                        alt={wallpaper.tags.join(', ')}
                        onClick={() => onWallpaperClick(wallpaper)}
                        onLoad={() => handleImageLoad(index)}
                    />
                </div>
            ))}
        </div>
    );
}
