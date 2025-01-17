import React, { useState } from 'react';
import styles from './Mobile.module.css';
import WallpaperDetails from '../WallpaperDetails/WallpaperDetails';

export default function Mobile({ wallpapers }) {
    const [selectedWallpaper, setSelectedWallpaper] = useState(null);

    return (
        <>
            <div className={styles.images__container}>
                {wallpapers.map((wallpaper) => (
                    <img
                        className={styles.image}
                        key={wallpaper._id}
                        src={`data:${wallpaper.thumbnailContentType};base64,${wallpaper.thumbnailData}`}
                        alt={wallpaper.tags.join(', ')}
                        onClick={() => setSelectedWallpaper(wallpaper)}
                    />
                ))}
            </div>
            {selectedWallpaper && (
                <WallpaperDetails wallpaper={selectedWallpaper} onClose={() => setSelectedWallpaper(null)} />
            )}
        </>
    );
}
