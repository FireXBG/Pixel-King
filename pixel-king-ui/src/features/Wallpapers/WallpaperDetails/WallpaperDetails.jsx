import React, { useState } from 'react';
import styles from './WallpaperDetails.module.css';
import axios from 'axios';

const resolutions = [
    { label: '1080p (Full HD)', key: 'HD', cost: 0 },
    { label: '4K (Ultra HD)', key: '4K', cost: 5 },
    { label: '8K (Ultra HD)', key: '8K', cost: 10 },
];

function WallpaperDetails({ wallpaper, onClose, userPlan, userCredits, onDownloadSuccess }) {
    const [isClosing, setIsClosing] = useState(false);
    const [downloading, setDownloading] = useState(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleDownload = async (resolution) => {
        const costInPixels = resolution.cost;

        // Check if the download is free based on the user's plan
        const isFreeDownload = (userPlan === 'Premium' && resolution.key !== '8K') || userPlan === 'King';

        if (!isFreeDownload && userCredits < costInPixels) {
            alert('Not enough pixels to download this wallpaper');
            return;
        }

        setDownloading(resolution.label);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/download`, {
                wallpaperId: wallpaper._id,
                resolution: resolution.key
            }, {
                headers: {
                    Authorization: localStorage.getItem('userToken')
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${wallpaper._id}_${resolution.label}.jpg`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            // Deduct pixels after download if necessary
            if (!isFreeDownload) {
                onDownloadSuccess(costInPixels);
            }
        } catch (error) {
            console.error('Error downloading wallpaper:', error);
        }
        setDownloading(null);
    };

    const { _id, tags, thumbnailID } = wallpaper;

    return (
        <>
            <div className={styles.overlay} onClick={handleClose}></div>
            <div className={`${styles.wallpaperDetails} ${isClosing ? styles.wallpaperDetailsClosing : ''}`}>
                <button className={styles.closeButton} onClick={handleClose}>×</button>
                <div className={styles.wallpaperPreview}>
                    <img src={`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${thumbnailID}`} alt="Wallpaper Preview" />
                </div>
                <div className={styles.wallpaperInfo}>
                    <div className={styles.tags}>
                        <strong>Tags: </strong>{tags.join(', ')}
                    </div>
                    <div className={styles.downloadOptions}>
                        <strong>Download Options:</strong>
                        <ul>
                            {resolutions.map((res) => {
                                const isFreeDownload = (userPlan === 'Premium' && res.key !== '8K') || userPlan === 'King';
                                return (
                                    <li key={res.key}>
                                        <button
                                            className={styles.downloadButton}
                                            onClick={() => handleDownload(res)}
                                            disabled={downloading !== null}
                                        >
                                            {downloading === res.label
                                                ? 'Downloading...'
                                                : `${res.label} ${isFreeDownload ? '(Free)' : `- ${res.cost} Pixels`}`}
                                        </button>
                                    </li>
                                );
                            })}
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