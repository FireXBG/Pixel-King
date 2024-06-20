import styles from './Mobile.module.css';

export default function Mobile({ currentPage, imagesPerPage, wallpapers }) {
    // Directly use wallpapers array without slicing
    console.log('Rendering Mobile images:', wallpapers);

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
