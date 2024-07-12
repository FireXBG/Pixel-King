import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import styles from './UploadWallpaper.module.css';
import { io } from 'socket.io-client';

const socket = io(`${process.env.REACT_APP_BACKEND_URL}`);

function UploadWallpaperComponent({ onSuccess }) {
    const [originalFiles, setOriginalFiles] = useState([]);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [tags, setTags] = useState({});
    const [view, setView] = useState({});
    const [isPaid, setIsPaid] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [targetProgress, setTargetProgress] = useState(0);
    const [showContainer, setShowContainer] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [showCompletedText, setShowCompletedText] = useState(false);

    const easeInOut = (current, target, factor = 0.1) => {
        if (current < target) {
            return Math.min(current + factor * (target - current), target);
        } else {
            return Math.max(current - factor * (current - target), target);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                return easeInOut(prevProgress, targetProgress);
            });
        }, 50);

        return () => clearInterval(interval);
    }, [targetProgress]);

    useEffect(() => {
        socket.on('uploadProgress', (data) => {
            setTargetProgress(data.progress);
        });

        socket.on('uploadComplete', () => {
            setCompleted(true);
            setTargetProgress(100);
            setShowCompletedText(true);

            const delayForCompletedText = setTimeout(() => {
                setShowContainer(false);
                onSuccess();
            }, 1000); // Delay to ensure "Completed" text is shown for 1000ms

            return () => clearTimeout(delayForCompletedText);
        });

        return () => {
            socket.off('uploadProgress');
            socket.off('uploadComplete');
        };
    }, [onSuccess]);

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

    const compressFiles = async (files) => {
        const zip = new JSZip();
        files.forEach((file, index) => {
            zip.file(file.name, file);
        });

        const compressedContent = await zip.generateAsync({ type: 'blob' });

        // Optional: Save the zip file locally for testing
        // saveAs(compressedContent, 'compressed_files.zip');

        return compressedContent;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (originalFiles.length === 0) {
            alert('Please select a file to upload');
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        setCompleted(false);
        setShowCompletedText(false);

        const compressedFiles = await compressFiles(originalFiles);

        const formData = new FormData();
        formData.append('compressedFiles', compressedFiles, 'compressed_files.zip');
        Object.keys(tags).forEach((key) => {
            formData.append(`tags_${key}`, tags[key]);
            formData.append(`view_${key}`, view[key] || 'desktop');
            formData.append(`isPaid_${key}`, isPaid[key] || false);
        });

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files');
        } finally {
            setLoading(false);
        }
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
                            {loading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload'}
                        </button>
                    </form>
                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.loadingText}>
                                Uploading... {Math.round(uploadProgress)}%
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