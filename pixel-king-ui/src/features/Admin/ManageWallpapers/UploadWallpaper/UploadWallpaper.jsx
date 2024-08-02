import React, { useState } from 'react';
import axios from 'axios';
import styles from './UploadWallpaper.module.css';
import { v4 as uuidv4 } from 'uuid';

function UploadWallpaperComponent({ onSuccess }) {
    const [originalFiles, setOriginalFiles] = useState([]);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [tags, setTags] = useState({});
    const [view, setView] = useState({});
    const [isPaid, setIsPaid] = useState({});
    const [loading, setLoading] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);
    const [individualProgress, setIndividualProgress] = useState([]);
    const [showContainer, setShowContainer] = useState(true);
    const [processing, setProcessing] = useState(false);

    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks

    const createFileChunks = (file) => {
        const chunks = [];
        let start = 0;
        while (start < file.size) {
            const chunk = file.slice(start, start + CHUNK_SIZE);
            chunks.push(chunk);
            start += CHUNK_SIZE;
        }
        return chunks;
    };

    const uploadChunk = async (chunk, fileId, chunkIndex, totalChunks, metadata, fileIndex) => {
        const formData = new FormData();
        formData.append('fileId', fileId);
        formData.append('chunkIndex', chunkIndex);
        formData.append('chunk', chunk);
        formData.append('totalChunks', totalChunks);
        formData.append('metadata', JSON.stringify(metadata));
        formData.append('fileIndex', fileIndex);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.allChunksReceived;
        } catch (error) {
            console.error('Error uploading chunk:', error);
            throw error;
        }
    };

    const uploadFileInChunks = async (file, metadata, fileIndex) => {
        const fileId = uuidv4(); // Unique identifier for the file
        const chunks = createFileChunks(file);
        let allChunksReceived = false;
        for (let i = 0; i < chunks.length; i++) {
            allChunksReceived = await uploadChunk(chunks[i], fileId, i, chunks.length, metadata, fileIndex);
            const progress = ((i + 1) / chunks.length) * 100;
            setIndividualProgress((prevProgress) => {
                const newProgress = [...prevProgress];
                newProgress[fileIndex] = progress;
                const totalProgress = newProgress.reduce((a, b) => a + b, 0) / newProgress.length;
                setOverallProgress(totalProgress);
                return newProgress;
            });
        }
        return { fileId, totalChunks: chunks.length, metadata: JSON.stringify(metadata), allChunksReceived };
    };

    const resizeImage = (file, maxWidth, maxHeight, quality) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        setProcessing(true);
        const newFiles = Array.from(e.target.files);
        const resizedFiles = await Promise.all(
            newFiles.map((file) => resizeImage(file, 800, 600, 0.7))
        );
        setOriginalFiles(newFiles);
        setPreviewFiles(resizedFiles);
        setProcessing(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setProcessing(true);
        const newFiles = Array.from(e.dataTransfer.files);
        const resizedFiles = await Promise.all(
            newFiles.map((file) => resizeImage(file, 800, 600, 0.7))
        );
        setOriginalFiles(newFiles);
        setPreviewFiles(resizedFiles);
        setProcessing(false);
    };

    const handleTagsChange = (e, index) => {
        setTags((prevTags) => ({
            ...prevTags,
            [index]: e.target.value
        }));
    };

    const handleViewChange = (e, index, value) => {
        setView((prevView) => ({
            ...prevView,
            [index]: value
        }));
    };

    const handleIsPaidChange = (e, index) => {
        setIsPaid((prevIsPaid) => ({
            ...prevIsPaid,
            [index]: e.target.checked
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (originalFiles.length === 0) {
            alert('Please select a file to upload');
            return;
        }

        setLoading(true);
        setOverallProgress(0);
        setIndividualProgress(new Array(originalFiles.length).fill(0));

        const metadata = originalFiles.map((_, index) => ({
            tags: tags[index] ? tags[index].split(' ') : [],
            view: view[index] || 'desktop', // Default to 'desktop' if not set
            isPaid: isPaid[index] || false,
        }));

        const uploadPromises = originalFiles.map((file, index) => uploadFileInChunks(file, metadata[index], index));
        const filesData = await Promise.all(uploadPromises);

        console.log("All files uploaded, sending complete request...");

        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/uploadComplete`, { files: filesData });

        console.log("Upload complete request sent.");

        // Close the upload component and trigger the parent's fetch wallpapers method
        setLoading(false);
        setShowContainer(false);
        console.log("Calling onSuccess...");
        onSuccess();
    };

    return (
        <>
            {showContainer && (
                <div
                    className={styles.upload__container}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <h1>Wallpapers upload menu</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="wallpaper">Click me or drag files to upload</label>
                        <input type="file" id="wallpaper" name="wallpaper" multiple onChange={handleFileChange} />
                        {processing && <div>Processing files...</div>}
                        <div className={styles.previews}>
                            {previewFiles.map((file, index) => (
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
                                                onChange={(e) => handleViewChange(e, index, 'desktop')}
                                            />
                                            Desktop (16:9)
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`view_${index}`}
                                                value="mobile"
                                                checked={view[index] === 'mobile'}
                                                onChange={(e) => handleViewChange(e, index, 'mobile')}
                                            />
                                            Mobile (9:16)
                                        </label>
                                    </div>
                                    <div className={styles.viewSelector}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name={`isPaid_${index}`}
                                                value="isPaid"
                                                onChange={(e) => handleIsPaidChange(e, index)}
                                            />
                                            Paid
                                        </label>
                                    </div>
                                    <div className={styles.progressBar}>
                                        {individualProgress[index]}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="admin__button" type="submit" disabled={loading}>
                            {loading ? `Uploading... ${Math.round(overallProgress)}%` : 'Upload'}
                        </button>
                    </form>
                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.loadingText}>
                                Uploading... {Math.round(overallProgress)}%
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default UploadWallpaperComponent;
