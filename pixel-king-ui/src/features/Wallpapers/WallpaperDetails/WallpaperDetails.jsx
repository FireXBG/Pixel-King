import React from 'react';
import styles from './WallpaperDetails.module.css';

const resolutions = {
    desktop: [
        { label: '1080p (Full HD)', resolution: '1920 x 1080', aspectRatio: '16:9' },
        { label: '1440p (Quad HD)', resolution: '2560 x 1440', aspectRatio: '16:9' },
        { label: '4K (Ultra HD)', resolution: '3840 x 2160', aspectRatio: '16:9' },
        { label: '5K', resolution: '5120 x 2880', aspectRatio: '16:9' },
        { label: '8K (Ultra HD)', resolution: '7680 x 4320', aspectRatio: '16:9' },
    ],
    mobile: [
        { label: '720p (HD)', resolution: '1280 x 720', aspectRatio: '16:9' },
        { label: '1080p (Full HD)', resolution: '1920 x 1080', aspectRatio: '16:9' },
        { label: '1440p (Quad HD)', resolution: '2560 x 1440', aspectRatio: '16:9' },
        { label: '4K (Ultra HD)', resolution: '3840 x 2160', aspectRatio: '16:9' },
    ],
};

function WallpaperDetails({ wallpaper, onClose }) {
    const { thumbnailData, thumbnailContentType, tags, view } = wallpaper;

    return (
        <>
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={styles.wallpaperDetails}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                <div className={styles.wallpaperPreview}>
                    <img src={`data:${thumbnailContentType};base64,${thumbnailData}`} alt="Wallpaper Preview" />
                </div>
                <div className={styles.wallpaperInfo}>
                    <div className={styles.tags}>
                        <strong>Tags: </strong>{tags.join(', ')}
                    </div>
                    <div className={styles.downloadOptions}>
                        <strong>Download Options:</strong>
                        <ul>
                            {resolutions[view].map((res) => (
                                <li key={res.label}>
                                    <button className={styles.downloadButton}>
                                        {res.label} ({res.resolution})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WallpaperDetails;
