import styles from './Wallpapers.module.css';
import phoneIcon from '../../assets/phone.svg';
import desktopIcon from '../../assets/computer.svg';
import {useState} from "react";
import Desktop from "./Desktop/Desktop";
import Mobile from "./Mobile/Mobile";

export default function Wallpapers() {
    const [deviceType, setDeviceType] = useState('desktop');
    const [currentPage, setCurrentPage] = useState(1);
    const imagesPerPage = 20;

    function setDeviceTypeHandler(type) {
        setDeviceType(type);
        setCurrentPage(1);
    }

    function handlePageChange(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0)
    }

  return (
      <>
          <div className={styles.search__container}>
              <input className={styles.search} placeholder='Example: Sci-Fi spaceships war'/>
              <button className={styles.submit__button}>Search</button>
              <div className={styles.device__type__container}>
                  <button onClick={() => {
                      setDeviceType('mobile')
                  }} className={`${styles.device__type__btn} ${styles.mobile__btn}`}>
                      <img className={styles.mobile__btn__img} src={phoneIcon} alt='mobile button'/>
                  </button>
                  <button onClick={() => {
                      setDeviceType('desktop')
                  }} className={`${styles.device__type__btn} ${styles.desktop__btn}`}>
                      <img className={styles.desktop__btn__img} src={desktopIcon} alt='desktop button'/>
                  </button>
              </div>
          </div>
          <section>
              {deviceType === 'desktop' ? <Desktop currentPage={currentPage} imagesPerPage={imagesPerPage} /> : <Mobile currentPage={currentPage} imagesPerPage={imagesPerPage} />}
          </section>
          <div className={styles.pagination}>
              <button
                  disabled={currentPage === 1}
                  className={styles.page__btn}
                  onClick={() => handlePageChange(currentPage - 1)}
              >
                  Previous
              </button>
              <span>{currentPage}</span>
              <button
                  className={styles.page__btn}
                  onClick={() => handlePageChange(currentPage + 1)}
              >
                  Next
              </button>
          </div>
      </>
  );
}