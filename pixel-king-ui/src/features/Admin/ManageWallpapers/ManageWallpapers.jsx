import styles from './ManageWallpapers.module.css';
import UploadWallpaper from './UploadWallpaper/UploadWallpaper';
import { useState } from 'react';

function ManageWallpapers() {
    const [uploadWallpapersMenu, setUploadWallpapersMenu] = useState(false);

    const toggleUploadMenu = () => {
        setUploadWallpapersMenu(!uploadWallpapersMenu);
    };

    return (
        <div>
            <button className='admin__button' onClick={toggleUploadMenu}>Upload Wallpapers</button>
            {uploadWallpapersMenu && <UploadWallpaper />}
        </div>
    );
}

export default ManageWallpapers;
