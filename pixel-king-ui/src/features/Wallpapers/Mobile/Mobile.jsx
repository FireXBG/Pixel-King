import React from 'react';
import styles from './Mobile.module.css';
import WallpaperDetails from '../WallpaperDetails/WallpaperDetails';

export default function Mobile({ wallpapers, onWallpaperClick }) {
    return (
        <>
            <div className={styles.images__container}>
                {wallpapers.map((wallpaper) => (
                    <img
                        className={styles.image}
                        key={wallpaper._id}
                        src={`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.driveID_HD}`}
                        alt={wallpaper.tags.join(', ')}
                        onClick={() => onWallpaperClick(wallpaper)}
                    />
                ))}
            </div>
        </>
    );
}
