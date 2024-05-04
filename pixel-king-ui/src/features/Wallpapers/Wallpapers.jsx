import styles from './Wallpapers.module.css';
import phoneIcon from '../../assets/phone.svg';
import desktopIcon from '../../assets/computer.svg';

export default function Wallpapers() {
  return (
    <>
        <div className={styles.search__container}>
            <input className={styles.search} placeholder='Example: Sci-Fi spaceship war' />
            <button className={styles.submit__button}>Submit</button>
            <div className={styles.device__type__container}>
                <button className={styles.device__type__btn}>
                    <img src={phoneIcon} alt='search' />
                </button>
                <button className={styles.device__type__btn}>
                    <img src={desktopIcon} alt='filter' />
                </button>
            </div>
        </div>
    </>
  );
}