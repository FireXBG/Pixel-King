import styles from './Desktop.module.css';

export default function Desktop({ currentPage, imagesPerPage, wallpapers }) {
    // Directly use wallpapers array without slicing
    console.log('Rendering Desktop images:', wallpapers);

    return (
        <div className={styles.images__container}>
            {wallpapers.map((wallpaper, i) => (
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
