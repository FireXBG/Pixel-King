import React from 'react';
import styles from './Desktop.module.css';

export default function Desktop({ wallpapers, onWallpaperClick, onImageLoad, imagesLoaded }) {
    return (
        <div className={styles.images__container}>
            {new Array(9).fill(null).map((_, index) => (
                <div key={index} className={styles.imageWrapper}>
                    {!imagesLoaded[index] && (
                        <div className={`${styles.placeholder} ${imagesLoaded[index] ? styles.fadeOut : ''}`}></div>
                    )}
                    {wallpapers[index] && (
                        <img
                            className={`${styles.image} ${imagesLoaded[index] ? styles.loaded : ''}`}
                            src={`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpapers[index].thumbnailID}`}
                            alt={wallpapers[index].tags.join(', ')}
                            onClick={() => onWallpaperClick(wallpapers[index])}
                            onLoad={() => onImageLoad(index)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
