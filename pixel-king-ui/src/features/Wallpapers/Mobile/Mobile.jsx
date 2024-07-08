import React, { useState, useEffect } from 'react';
import styles from './Mobile.module.css';
import WallpaperDetails from '../WallpaperDetails/WallpaperDetails';

export default function Mobile({ wallpapers }) {
    const [selectedWallpaper, setSelectedWallpaper] = useState(null);

    useEffect(() => {
        wallpapers.forEach(wallpaper => {
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.driveID_HD}`;
            console.log(`Image URL: ${url}`);
        });
    }, [wallpapers]);

    return (
        <>
            <div className={styles.images__container}>
                {wallpapers.map((wallpaper) => (
                    <img
                        className={styles.image}
                        key={wallpaper._id}
                        src={`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.driveID_HD}`}
                        alt={wallpaper.tags.join(', ')}
                        onClick={() => setSelectedWallpaper(wallpaper)}
                        onError={(e) => console.error(`Error loading image: ${e.target.src}`)}
                    />
                ))}
            </div>
            {selectedWallpaper && (
                <WallpaperDetails wallpaper={selectedWallpaper} onClose={() => setSelectedWallpaper(null)} />
            )}
        </>
    );
}
