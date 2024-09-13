import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditTagsModal.module.css';

function EditTagsModal({ wallpaper, onClose, onSave }) {
    const [tags, setTags] = useState(wallpaper.tags.join(' '));
    const [isPaid, setIsPaid] = useState(wallpaper.isPaid);
    const [imagePreview, setImagePreview] = useState(null);  // New state to store the image preview

    // Fetch image preview when modal opens
    useEffect(() => {
        const fetchImagePreview = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/wallpapers/${wallpaper.thumbnailID}?preview=true`,
                    { responseType: 'arraybuffer' }  // Get image data as binary
                );

                // Convert array buffer to base64 string
                const base64Image = btoa(
                    new Uint8Array(response.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                setImagePreview(`data:image/jpeg;base64,${base64Image}`);  // Convert image to base64 and set
            } catch (error) {
                console.error('Error fetching image preview:', error);
            }
        };

        fetchImagePreview();
    }, [wallpaper.thumbnailID]);

    const handleSave = () => {
        onSave(wallpaper._id, tags.split(' ').filter(tag => tag.trim() !== ''), isPaid);
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Edit Tags</h2>
                {imagePreview ? (  // Check if image preview is available
                    <img
                        src={imagePreview}
                        alt={wallpaper.name}
                        className={styles.image}
                    />
                ) : (
                    <p>Loading image...</p>  // Display loading message if image is not fetched yet
                )}
                <textarea
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={styles.textarea}
                />
                <div className={styles.checkboxContainer}>
                    <label htmlFor="isPaid" className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            id="isPaid"
                            checked={isPaid}
                            onChange={() => setIsPaid(!isPaid)}
                        />
                        Paid
                    </label>
                </div>
                <button className={styles.saveButton} onClick={handleSave}>Save</button>
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default EditTagsModal;
