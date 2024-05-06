import styles from './Wallpapers.module.css';
import phoneIcon from '../../assets/phone.svg';
import desktopIcon from '../../assets/computer.svg';
import {useState} from "react";
import Desktop from "./Desktop/Desktop";
import Mobile from "./Mobile/Mobile";

export default function Wallpapers() {
    const [deviceType, setDeviceType] = useState('desktop');

    function setDeviceTypeHandler(type) {
        setDeviceType(type);
    }

  return (
    <>
        <div className={styles.search__container}>
            <input className={styles.search} placeholder='Example: Sci-Fi spaceship war' />
            <button className={styles.submit__button}>Search</button>
            <div className={styles.device__type__container}>
                <button onClick={() => {setDeviceType('mobile')}} className={`${styles.device__type__btn} ${styles.mobile__btn}`}>
                    <img className={styles.mobile__btn__img} src={phoneIcon} alt='mobile button' />
                </button>
                <button onClick={() => {setDeviceType('desktop')}} className={`${styles.device__type__btn} ${styles.desktop__btn}`}>
                    <img className={styles.desktop__btn__img} src={desktopIcon} alt='desktop button'/>
                </button>
            </div>
        </div>
        <section>
            {deviceType === 'desktop' ? <Desktop /> : <Mobile />}
        </section>
    </>
  );
}