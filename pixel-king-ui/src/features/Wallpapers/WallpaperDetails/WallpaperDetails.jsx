import React, { useState, useContext } from 'react';
import axios from 'axios';
import styles from './WallpaperDetails.module.css';
import pixelsImg from '../../../assets/Diamond.png';
import PixelsContext from '../../../context/pixelsContext'; // Import the PixelsContext

const resolutions = [
    { label: '1080p (Full HD)', key: 'HD', cost: 0 },
    { label: '4K (Ultra HD)', key: '4K', cost: 5 },
    { label: '8K (Ultra HD)', key: '8K', cost: 10 },
];

function WallpaperDetails({ wallpaper, onClose, userPlan, free4kDownloads, free8kDownloads }) {
    const [downloading, setDownloading] = useState(null);
    const { updatePixels } = useContext(PixelsContext); // Access updatePixels from context

    const handleDownload = async (resolution) => {
        const costInPixels = resolution.cost;

        // Determine if the download is free based on the user's plan and remaining free downloads
        const isFreeDownload =
            (userPlan === 'Premium' && resolution.key !== '8K') ||
            userPlan === 'King' ||
            (resolution.key === '4K' && free4kDownloads > 0) ||
            (resolution.key === '8K' && free8kDownloads > 0);

        if (!isFreeDownload && costInPixels > 0) {
            // Proceed with the download and then fetch the updated pixel count
            setDownloading(resolution.label);

            try {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/download`, {
                    wallpaperId: wallpaper._id,
                    resolution: resolution.key,
                }, {
                    headers: {
                        Authorization: localStorage.getItem('userToken'),
                    },
                    responseType: 'blob',
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${wallpaper._id}_${resolution.label}.jpg`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);

                // Fetch updated pixels after download completes
                await updatePixels();
            } catch (error) {
                console.error('Error downloading wallpaper:', error);
                alert('Failed to download wallpaper.');
            }

            setDownloading(null);
        }
    };

    const { _id, tags, thumbnailID } = wallpaper;

    return (
        <>
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={`${styles.wallpaperDetails}`}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
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
                                let isFreeDownload =
                                    (userPlan === 'Premium' && res.key !== '8K') ||
                                    userPlan === 'King';

                                if (!isFreeDownload) {
                                    if (res.key === '4K' && free4kDownloads > 0) {
                                        isFreeDownload = true;
                                    } else if (res.key === '8K' && free8kDownloads > 0) {
                                        isFreeDownload = true;
                                    }
                                }

                                return (
                                    <li key={res.key}>
                                        <button
                                            className={styles.downloadButton}
                                            onClick={() => handleDownload(res)}
                                            disabled={downloading !== null}
                                        >
                                            {downloading === res.label
                                                ? 'Downloading...'
                                                : (
                                                    <div className={styles.pixelsDownloadContainer}>
                                                        {res.label}
                                                        {res.cost > 0 && !isFreeDownload && (
                                                            <>
                                                                {' '}
                                                                <img src={pixelsImg} className={styles.pixelsImg} alt="Pixels icon" />
                                                                {res.cost}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
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
