import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './UploadWallpaper.module.css';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io(`${process.env.REACT_APP_BACKEND_URL}`);

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
    const [completed, setCompleted] = useState(false);
    const [showCompletedText, setShowCompletedText] = useState(false);

    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks

    useEffect(() => {
        socket.on('uploadProgress', (data) => {
            setIndividualProgress((prevProgress) => {
                const newProgress = [...prevProgress];
                newProgress[data.fileIndex] = data.progress;
                const totalProgress = newProgress.reduce((a, b) => a + b, 0) / newProgress.length;
                setOverallProgress(totalProgress);
                return newProgress;
            });
        });

        socket.on('uploadComplete', (data) => {
            setIndividualProgress((prevProgress) => {
                const newProgress = [...prevProgress];
                newProgress[data.fileIndex] = 100;
                const totalProgress = newProgress.reduce((a, b) => a + b, 0) / newProgress.length;
                setOverallProgress(totalProgress);

                if (newProgress.every(progress => progress === 100)) {
                    setCompleted(true);
                    setShowCompletedText(true);

                    const delayForCompletedText = setTimeout(() => {
                        setShowContainer(false);
                        onSuccess();
                    }, 1000); // Delay to ensure "Completed" text is shown for 1000ms

                    return () => clearTimeout(delayForCompletedText);
                }

                return newProgress;
            });
        });

        return () => {
            socket.off('uploadProgress');
            socket.off('uploadComplete');
        };
    }, [originalFiles, onSuccess]);

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
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error uploading chunk:', error);
            throw error;
        }
    };

    const uploadFileInChunks = async (file, metadata, fileIndex) => {
        const fileId = uuidv4(); // Unique identifier for the file
        const chunks = createFileChunks(file);
        await Promise.all(chunks.map((chunk, i) => uploadChunk(chunk, fileId, i, chunks.length, metadata, fileIndex)));
    };

    const handleFileChange = async (e) => {
        const newFiles = Array.from(e.target.files);
        const resizedFiles = await Promise.all(
            newFiles.map((file) => resizeImage(file, 800, 600, 0.7))
        );
        setOriginalFiles(newFiles);
        setPreviewFiles(resizedFiles);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files);
        const resizedFiles = await Promise.all(
            newFiles.map((file) => resizeImage(file, 800, 600, 0.7))
        );
        setOriginalFiles(newFiles);
        setPreviewFiles(resizedFiles);
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
        setCompleted(false);
        setShowCompletedText(false);

        const metadata = originalFiles.map((_, index) => ({
            tags: tags[index] ? tags[index].split(' ') : [],
            view: view[index],
            isPaid: isPaid[index] || false,
        }));

        await Promise.all(originalFiles.map((file, index) => uploadFileInChunks(file, metadata[index], index)));

        setLoading(false);
        setCompleted(true);
        setOverallProgress(100);
        setShowCompletedText(true);

        const delayForCompletedText = setTimeout(() => {
            setShowContainer(false);
            onSuccess();
        }, 1000); // Delay to ensure "Completed" text is shown for 1000ms

        return () => clearTimeout(delayForCompletedText);
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
                    {showCompletedText && (
                        <div className={styles.completedText}>
                            Completed
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default UploadWallpaperComponent;
