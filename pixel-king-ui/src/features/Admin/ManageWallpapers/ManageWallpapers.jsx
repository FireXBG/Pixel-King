import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import styles from './ManageWallpapers.module.css';
import UploadWallpaper from './UploadWallpaper/UploadWallpaper';
import EditTagsModal from './EditTagsModal/EditTagsModal';
import AdminMessage from "../../../core/adminMessage/adminMessage";

const socket = io(process.env.REACT_APP_BACKEND_URL);

function ManageWallpapers() {
    const [uploadWallpapersMenu, setUploadWallpapersMenu] = useState(false);
    const [wallpapers, setWallpapers] = useState([]);
    const [deleting, setDeleting] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('desktop');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingWallpaper, setEditingWallpaper] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [adminMessage, setAdminMessage] = useState(null);
    const [storageQuota, setStorageQuota] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const imagesPerPage = 20;
    const cancelTokenSource = useRef(null);

    const checkUploadStatus = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/checkUploadStatus`);
            if (response.data.isUploadInProgress) {
                setUploadProgress('Calculating...');
                socket.on('uploadProgress', (data) => {
                    setUploadProgress(data.percentage);
                });
            } else {
                setUploadProgress(null);
            }
        } catch (error) {
            console.error('Error checking upload status:', error);
        }
    };

    useEffect(() => {
        checkUploadStatus();
        fetchWallpapers();
        fetchStorageQuota();
        return () => {
            socket.off('uploadProgress');
        };
    }, [filter, currentPage]);

    const fetchWallpapers = async (reset = false) => {
        setLoading(true);
        try {
            let url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers?view=${filter}&page=${currentPage}&limit=${imagesPerPage}`;

            if (searchQuery && !reset) {
                // If there's a search query, fetch only that wallpaper by Mongo ID
                url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/mongo/${searchQuery}`;
                const response = await axios.get(url, { responseType: 'blob' });
                const fileReader = new FileReader();

                fileReader.readAsDataURL(response.data);
                fileReader.onloadend = function () {
                    const imageDataUrl = fileReader.result;
                    setWallpapers([{ imageDataUrl }]);
                    setTotalPages(1); // Only one result
                    setLoading(false);
                };
            } else {
                // Fetch all wallpapers with pagination
                const response = await axios.get(url);
                setWallpapers(response.data.wallpapers || []);
                setTotalPages(Math.ceil(response.data.totalCount / imagesPerPage));
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
            setError('Failed to fetch wallpapers. Please try again later.');
            setLoading(false);
        }
    };

    const fetchStorageQuota = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getStorageQuota`);
            const storageQuota = response.data.storageQuota;

            const formatToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2);

            setStorageQuota({
                limit: formatToGB(Number(storageQuota.limit)),
                usage: formatToGB(Number(storageQuota.usage)),
                usageInDrive: formatToGB(Number(storageQuota.usageInDrive)),
                usageInDriveTrash: formatToGB(Number(storageQuota.usageInDriveTrash))
            });
        } catch (error) {
            console.error('Error fetching storage quota:', error);
            setError('Failed to fetch storage quota. Please try again later.');
        }
    };

    const handleUploadSuccess = () => {
        setUploadWallpapersMenu(false);
        setUploadProgress('Calculating...');
        fetchWallpapers();
        fetchStorageQuota();
        setTimeout(checkUploadStatus, 2000);
    };

    const handleDelete = async (wallpaperId) => {
        setDeleting((prev) => ({ ...prev, [wallpaperId]: true }));
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaperId}`);
            fetchWallpapers();
            fetchStorageQuota();
        } catch (error) {
            console.error('Error deleting wallpaper:', error);
            alert('Failed to delete wallpaper');
        } finally {
            setDeleting((prev) => ({ ...prev, [wallpaperId]: false }));
        }
    };

    const toggleUploadMenu = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/checkUploadStatus`);
            if (response.data.isUploadInProgress) {
                setAdminMessage({
                    title: 'Upload in Progress',
                    message: 'Another upload is already in progress. Please wait until it completes.',
                });
                return;
            }
            setUploadWallpapersMenu(!uploadWallpapersMenu);
        } catch (error) {
            console.error('Error checking upload status:', error);
            alert('Failed to check upload status');
        }
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleEdit = (wallpaper) => {
        setEditingWallpaper(wallpaper);
    };

    const handleSaveTags = async (wallpaperId, newTags, newIsPaid) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaperId}`, {
                tags: newTags,
                isPaid: newIsPaid
            });
            fetchWallpapers();
        } catch (error) {
            console.error('Error saving tags:', error);
            alert('Failed to save tags');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) {
            fetchWallpapers();
            return;
        }
        setLoading(true);
        fetchWallpapers();
    };

    const handleReset = () => {
        setSearchQuery('');
        setCurrentPage(1);
        fetchWallpapers(true); // Fetch wallpapers with reset
    };

    const handleMessageClose = () => {
        setAdminMessage(null);
    };

    useEffect(() => {
        if (uploadProgress === 100) {
            setTimeout(() => {
                setUploadProgress(null);
            }, 2000);
        }
    }, [uploadProgress]);

    return (
        <div className={styles.manageWallpapersContainer}>
            {adminMessage && (
                <AdminMessage
                    title={adminMessage.title}
                    message={adminMessage.message}
                    onClose={handleMessageClose}
                />
            )}
            <button className='admin__button' onClick={toggleUploadMenu}>
                {uploadWallpapersMenu ? 'Cancel Upload' : 'Upload Wallpapers'}
            </button>
            {uploadWallpapersMenu && <UploadWallpaper onSuccess={handleUploadSuccess} />}

            {uploadProgress !== null && (
                <div className={styles.uploadProgress}>
                    <div className={styles.progressBar} style={{ width: `${uploadProgress === 'Calculating...' ? 0 : uploadProgress}%` }}></div>
                    <div className={styles.progressText}>
                        {uploadProgress === 'Calculating...' ? 'Calculating progress...' : `Processing... ${Math.round(uploadProgress)}%`}
                    </div>
                </div>
            )}

            <div className={styles.filterContainer}>
                <label htmlFor="filter">Filter: </label>
                <select id="filter" value={filter} onChange={handleFilterChange}>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                </select>
                <input
                    type="text"
                    className={styles.search}
                    placeholder="Search by MongoDB ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={styles.submit__button} onClick={handleSearch}>Search</button>
                <button className={styles.submit__button} onClick={handleReset}>Reset</button>
            </div>

            {storageQuota && (
                <div className={styles.storageQuota}>
                    <p>Storage Used: {storageQuota.usage} GB / {storageQuota.limit} GB</p>
                    <p>Usage in Drive: {storageQuota.usageInDrive} GB</p>
                    <p>Usage in Drive Trash: {storageQuota.usageInDriveTrash} GB</p>
                </div>
            )}

            {error && <div className={styles.errorMessage}>{error}</div>}

            {loading ? (
                <div className={styles.loaderContainer}>
                    <div className={styles.loader}></div>
                </div>
            ) : (
                <div className={`${styles.wallpapersGrid} ${styles.fadeIn}`}>
                    {wallpapers.map((wallpaper, index) => (
                        <div key={index} className={styles.wallpaperItem}>
                            <img
                                src={wallpaper.imageDataUrl ? wallpaper.imageDataUrl : `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.thumbnailID}?preview=true`}
                                alt={wallpaper.name || 'Wallpaper'}
                                className={styles.wallpaperImage}
                            />
                            <div className={styles.wallpaperActions}>
                                <button className='admin__button' onClick={() => handleEdit(wallpaper)}>Edit</button>
                                <div className={styles.actionButtonContainer}>
                                    {deleting[wallpaper._id] ? (
                                        <div className={styles.loader}></div>
                                    ) : (
                                        <button className='admin__button'
                                                onClick={() => handleDelete(wallpaper._id)}>Delete</button>
                                    )}
                                </div>
                            </div>
                            <div>
                                {wallpaper.isPaid ? 'Paid' : 'Free'}
                            </div>
                            <div className={styles.tagsPreview}>
                                {wallpaper.tags ? wallpaper.tags.join(', ') : 'No tags'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && wallpapers.length > 0 && totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        disabled={currentPage === 1}
                        className={styles.page__btn}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span>{currentPage}</span>
                    <button
                        disabled={currentPage >= totalPages}
                        className={styles.page__btn}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {editingWallpaper && (
                <EditTagsModal
                    wallpaper={editingWallpaper}
                    onClose={() => setEditingWallpaper(null)}
                    onSave={handleSaveTags}
                />
            )}
        </div>
    );
}

export default ManageWallpapers;
