import styles from './MyAccount.module.css';
import pros from '../../assets/pro.png'
import cons from '../../assets/cons.png'

export default function MyAccount() {
    return (
        <div>
            <h1 className={styles.heading}>My Account</h1>
            <div className={styles.itemsWrapper}>
                <div className={styles.smallItemsWrapper}>
                    <div className={styles.smallItem}>
                        <h2 className={styles.secondHeading}>Personal Info</h2>
                        <div className={styles.firstSmallWrapper}>
                            <div className={styles.infoContainer}>
                                <p>Username: <span className={styles.spanGradient}>FireXBG</span></p>
                                <p>Email: <span className={styles.spanGradient}>krisi.bg111@icloud.com</span></p>
                            </div>
                            <div className={styles.infoActionButtons}>
                                <button className='button2'>Change Info</button>
                                <button className='button2'>Change Password</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.smallItemCredits}>
                        <h2 className={styles.secondHeading}>Credits</h2>
                        <div className={styles.creditsContainer}>
                            <p className={styles.creditsCount}>189</p>
                            <button className='button2 addButton'>+</button>
                        </div>
                    </div>
                </div>
                <div className={styles.bigItem}>
                    <h2 className={styles.secondHeading}>Plan</h2>
                    <p>Current plan: Free</p>
                    <div className={styles.prosAndCons}>
                        <ul className={styles.pros}>
                            <li>
                                <img src={pros} />
                                <p>Access to thousands of wallpapers</p>
                            </li>                            <li>
                                <img src={pros} />
                                <p>Download up to 10 4K wallpapers per day</p>
                            </li>
                            <li>
                                <img src={pros} />
                                <p>Add wallpapers to favorites</p>
                            </li>
                        </ul>
                        <ul className={styles.cons}>
                            <li>
                                <img src={cons}/>
                                <p>Free 8K wallpapers</p>
                            </li>
                            <li>
                                <img src={cons}/>
                                <p>Daily credits</p>
                            </li>
                            <li>
                                <img src={cons}/>
                                <p>Free custom wallpapers</p>
                            </li>
                        </ul>
                    </div>
                    <button className='button2'>Upgrade Now</button>
                </div>
            </div>
        </div>
    );
}