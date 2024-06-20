import React, { useState } from 'react';
import styles from './Mobile.module.css';
import WallpaperDetails from '../WallpaperDetails/WallpaperDetails';

export default function Mobile({ currentPage, imagesPerPage, wallpapers }) {
    const [selectedWallpaper, setSelectedWallpaper] = useState(null);

    const totalImages = wallpapers.length;
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, totalImages);
    const imagesToDisplay = wallpapers.slice(startIndex, endIndex);

    return (
        <>
            <div className={styles.images__container}>
                {imagesToDisplay.map((wallpaper, i) => (
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
