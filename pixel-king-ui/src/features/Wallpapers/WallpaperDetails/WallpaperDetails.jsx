import React, { useState } from 'react';
import styles from './WallpaperDetails.module.css';
import axios from 'axios';

const resolutions = {
    desktop: [
        { label: '1080p (Full HD)', resolution: '1920x1080' },
        { label: '1440p (Quad HD)', resolution: '2560x1440' },
        { label: '4K (Ultra HD)', resolution: '3840x2160' },
        { label: '5K', resolution: '5120x2880' },
        { label: '8K (Ultra HD)', resolution: '7680x4320' },
    ],
    mobile: [
        { label: '720p (HD)', resolution: '720x1280' },
        { label: '1080p (Full HD)', resolution: '1080x1920' },
        { label: '1440p (Quad HD)', resolution: '1440x2560' },
        { label: '4K (Ultra HD)', resolution: '2160x3840' },
        { label: '8K (Ultra HD)', resolution: '4320x7680' },
    ],
};

function WallpaperDetails({ wallpaper, onClose }) {
    const [isClosing, setIsClosing] = useState(false);
    const [downloading, setDownloading] = useState(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // Match the animation duration
    };

    const handleDownload = async (resolution, label) => {
        setDownloading(label);
        try {
            // Replace localhost:3001 with your actual backend URL
            const response = await axios.post('http://localhost:3001/admin/download', {
                wallpaperId: wallpaper._id,
                resolution: resolution.resolution,
            });

            const { base64Image, mimeType } = response.data;
            const link = document.createElement('a');
            link.href = `data:${mimeType};base64,${base64Image}`;
            link.download = `${wallpaper._id}_${resolution.label}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading wallpaper:', error);
        }
        setDownloading(null);
    };

    const { _id, thumbnailData, thumbnailContentType, tags, view } = wallpaper;

    return (
        <>
            <div className={styles.overlay} onClick={handleClose}></div>
            <div className={`${styles.wallpaperDetails} ${isClosing ? styles.wallpaperDetailsClosing : ''}`}>
                <button className={styles.closeButton} onClick={handleClose}>×</button>
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
                                    <button
                                        className={styles.downloadButton}
                                        onClick={() => handleDownload(res, res.label)}
                                        disabled={downloading !== null}
                                    >
                                        {downloading === res.label ? 'Downloading...' : `${res.label} (${res.resolution})`}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className={styles.wallpaperId}>
                    <strong>ID: </strong>{_id}
                </div>
            </div>
        </>
    );
}

export default WallpaperDetails;
