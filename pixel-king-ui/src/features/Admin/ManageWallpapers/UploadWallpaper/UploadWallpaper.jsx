import { useState } from 'react';
import axios from 'axios';
import styles from './UploadWallpaper.module.css';

function UploadWallpaper() {
    const [files, setFiles] = useState([]);
    const [tags, setTags] = useState({});
    const [view, setView] = useState({});

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(newFiles);
    };

    const handleTagsChange = (e, index) => {
        setTags((prevTags) => ({
            ...prevTags,
            [index]: e.target.value
        }));
    };

    const handleViewChange = (e, index) => {
        setView((prevView) => ({
            ...prevView,
            [index]: e.target.value
        }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files);
        setFiles(newFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            alert('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('wallpapers', file);
            formData.append(`tags_${index}`, tags[index] || '');
            formData.append(`view_${index}`, view[index] || 'desktop');
        });

        try {
            const response = await axios.post('http://localhost:3001/admin/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                alert('Files uploaded successfully');
            } else {
                alert('Failed to upload files');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files');
        }
    };

    return (
        <div
            className={styles.upload__container}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <h1>Wallpapers upload menu</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="wallpaper">Click me or drag files to upload</label>
                <input type="file" id="wallpaper" name="wallpaper" multiple onChange={handleFileChange} />
                <div className={styles.previews}>
                    {files.map((file, index) => (
                        <div key={index} className={styles.preview}>
                            <div className={styles.previewImageContainer}>
                                <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className={styles.previewImage} />
                            </div>
                            <textarea
                                placeholder="Tags (separated by spaces)"
                                value={tags[index] || ''}
                                onChange={(e) => handleTagsChange(e, index)}
                            />
                            <div className={styles.viewSelector}>
                                <label>
                                    <input
                                        type="radio"
                                        name={`view_${index}`}
                                        value="desktop"
                                        checked={view[index] === 'desktop'}
                                        onChange={(e) => handleViewChange(e, index)}
                                    />
                                    Desktop (16:9)
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name={`view_${index}`}
                                        value="mobile"
                                        checked={view[index] === 'mobile'}
                                        onChange={(e) => handleViewChange(e, index)}
                                    />
                                    Mobile (9:16)
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="admin__button" type="submit">Upload</button>
            </form>
        </div>
    );
}

export default UploadWallpaper;
