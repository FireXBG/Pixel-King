import React, { useState } from 'react';
import styles from './WallpaperDetails.module.css';
import axios from 'axios';

const resolutions = [
    { label: '1080p (Full HD)', key: 'HD' },
    { label: '4K (Ultra HD)', key: '4K' },
    { label: '8K (Ultra HD)', key: '8K' },
];

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

    const handleDownload = async (resolution) => {
        setDownloading(resolution.label);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/download`, {
                wallpaperId: wallpaper._id,
                resolution: resolution.key
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${wallpaper._id}_${resolution.label}.jpg`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading wallpaper:', error);
        }
        setDownloading(null);
    };

    const { _id, tags, previewBase64 } = wallpaper;

    return (
        <>
            <div className={styles.overlay} onClick={handleClose}></div>
            <div className={`${styles.wallpaperDetails} ${isClosing ? styles.wallpaperDetailsClosing : ''}`}>
                <button className={styles.closeButton} onClick={handleClose}>×</button>
                <div className={styles.wallpaperPreview}>
                    <img src={`data:image/jpeg;base64,${previewBase64}`} alt="Wallpaper Preview" />
                </div>
                <div className={styles.wallpaperInfo}>
                    <div className={styles.tags}>
                        <strong>Tags: </strong>{tags.join(', ')}
                    </div>
                    <div className={styles.downloadOptions}>
                        <strong>Download Options:</strong>
                        <ul>
                            {resolutions.map((res) => (
                                <li key={res.key}>
                                    <button
                                        className={styles.downloadButton}
                                        onClick={() => handleDownload(res)}
                                        disabled={downloading !== null}
                                    >
                                        {downloading === res.label ? 'Downloading...' : `${res.label}`}
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
