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
    const [adminMessage, setAdminMessage] = useState(null); // Admin message state
    const [storageQuota, setStorageQuota] = useState(null); // Storage quota state
    const [uploadProgress, setUploadProgress] = useState(null); // Upload progress state
    const imagesPerPage = 20;
    const cancelTokenSource = useRef(null);

    const checkUploadStatus = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/checkUploadStatus`);
            if (response.data.isUploadInProgress) {
                setUploadProgress('Calculating...');
                // Start listening for socket updates
                socket.on('uploadProgress', (data) => {
                    console.log('Received upload progress:', data.percentage);
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
        checkUploadStatus(); // Check upload status when component mounts
        fetchWallpapers();
        fetchStorageQuota(); // Fetch storage quota on component mount

        return () => {
            socket.off('uploadProgress');
        };
    }, [filter, currentPage]);

    const fetchWallpapers = async () => {
        setLoading(true);
        try {
            let url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers?view=${filter}&page=${currentPage}&limit=${imagesPerPage}`;
            if (filter === 'desktop' || filter === 'mobile') {
                url += `&preview=true`; // Add preview parameter conditionally
            }
            const response = await axios.get(url);
            const wallpapers = response.data.wallpapers || [];
            setWallpapers(wallpapers);
            setTotalPages(Math.ceil(response.data.totalCount / imagesPerPage));
            setLoading(false); // Stop loading when all images are loaded
        } catch (error) {
            console.error('Error fetching wallpapers:', error);
            setError('Failed to fetch wallpapers. Please try again later.');
            setLoading(false); // Stop loading if there's an error
        }
    };

    const fetchStorageQuota = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getStorageQuota`);
            const storageQuota = response.data.storageQuota;

            const formatToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2);

            setStorageQuota({
                limit: formatToGB(Number(storageQuota.limit)), // Convert bytes to GB
                usage: formatToGB(Number(storageQuota.usage)), // Convert bytes to GB
                usageInDrive: formatToGB(Number(storageQuota.usageInDrive)), // Convert bytes to GB
                usageInDriveTrash: formatToGB(Number(storageQuota.usageInDriveTrash)) // Convert bytes to GB
            });
        } catch (error) {
            console.error('Error fetching storage quota:', error);
            setError('Failed to fetch storage quota. Please try again later.');
        }
    };

    const handleUploadSuccess = () => {
        console.log("Upload success handler called");
        setUploadWallpapersMenu(false);
        setUploadProgress('Calculating...'); // Set initial state before receiving progress updates
        fetchWallpapers();
        fetchStorageQuota(); // Fetch updated storage quota after upload

        // Check upload status after 2 seconds
        setTimeout(checkUploadStatus, 2000);
    };

    const handleDelete = async (wallpaperId) => {
        setDeleting((prev) => ({ ...prev, [wallpaperId]: true }));
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaperId}`);
            fetchWallpapers();
            fetchStorageQuota(); // Fetch updated storage quota after deletion
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
        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers?view=${filter}&id=${searchQuery}`;
            const response = await axios.get(url);
            const wallpapers = response.data.wallpapers || [];
            setWallpapers(wallpapers);
            setTotalPages(1);
            setLoading(false); // Stop loading when all images are loaded
        } catch (error) {
            console.error('Error searching wallpaper by ID:', error);
            setError('Failed to search wallpaper. Please try again later.');
            setLoading(false); // Stop loading if there's an error
        }
    };

    const handleMessageClose = () => {
        setAdminMessage(null);
    };

    useEffect(() => {
        if (uploadProgress === 100) {
            setTimeout(() => {
                setUploadProgress(null);
            }, 2000); // Hide the progress bar after 2 seconds when it reaches 100%
        }
        console.log('Upload progress updated:', uploadProgress);
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
                    placeholder="Search by ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={styles.submit__button} onClick={handleSearch}>Search</button>
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
                    {wallpapers.map((wallpaper) => (
                        <div key={wallpaper._id} className={styles.wallpaperItem}>
                            <img
                                src={`${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.thumbnailID}?preview=true`}
                                alt={wallpaper.name}
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
                                {wallpaper.tags.join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && wallpapers.length > 0 && (
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
