import React, { useState } from 'react';
import styles from './EditTagsModal.module.css';

function EditTagsModal({ wallpaper, onClose, onSave }) {
    const [tags, setTags] = useState(wallpaper.tags.join(' '));

    const handleSave = () => {
        onSave(wallpaper._id, tags.split(' ').filter(tag => tag.trim() !== ''));
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Edit Tags</h2>
                <img
                    src={`data:${wallpaper.thumbnailContentType};base64,${wallpaper.thumbnailData}`}
                    alt={wallpaper.name}
                    className={styles.image}
                />
                <textarea
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={styles.textarea}
                />
                <button className={styles.saveButton} onClick={handleSave}>Save</button>
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default EditTagsModal;
