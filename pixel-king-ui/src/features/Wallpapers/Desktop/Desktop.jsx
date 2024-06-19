import styles from './Desktop.module.css';

export default function Desktop({ currentPage, imagesPerPage, wallpapers }) {
    const totalImages = wallpapers.length;
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, totalImages);
    const imagesToDisplay = wallpapers.slice(startIndex, endIndex);

    return (
        <div className={styles.images__container}>
            {imagesToDisplay.map((wallpaper) => (
                <img
                    className={styles.image}
                    key={wallpaper._id}
                    src={`data:${wallpaper.thumbnailContentType};base64,${wallpaper.thumbnailData}`}
                    alt={wallpaper.tags.join(', ')}
                />
            ))}
        </div>
    );
}
