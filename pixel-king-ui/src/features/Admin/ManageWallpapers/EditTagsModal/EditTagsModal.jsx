import React, { useState } from 'react';
import styles from './EditTagsModal.module.css';

function EditTagsModal({ wallpaper, onClose, onSave }) {
    const [tags, setTags] = useState(wallpaper.tags.join(' '));
    const [isPaid, setIsPaid] = useState(wallpaper.isPaid);

    const handleSave = () => {
        onSave(wallpaper._id, tags.split(' ').filter(tag => tag.trim() !== ''), isPaid);
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Edit Tags</h2>
                <img
                    src={`data:image/jpeg;base64,${wallpaper.previewBase64}`}
                    alt={wallpaper.name}
                    className={styles.image}
                />
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