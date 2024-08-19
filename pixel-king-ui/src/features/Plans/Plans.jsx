import styles from './Plans.module.css';
import pros from '../../assets/pro.png'
import {useEffect, useState} from "react";
import axios from "axios";

export default function Plans() {
    const [currentPlan, setCurrentPlan] = useState('Free');
    const [pixels, setPixels] = useState(0);
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/info`, {
            headers: {
                Authorization: localStorage.getItem('userToken')
            }
        }).then(response => {
            console.log(response.data);
            setCurrentPlan(response.data.plan);
            setPixels(response.data.credits);
        }).catch(error => {
            console.error('Error during user info:', error);
        })
    }, []);

    return (
        <div className={styles.shopWrapper}>
            <h1 className='mainH1'>Plans</h1>
            <div className={styles.plansContainer}>
                <div className={styles.plan}>
                    <h2>Free</h2>
                    <p className={styles.price}>€0.00 <br /><span>For Ever</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li>
                                <img src={pros} />
                                <p>Up to 10 (4K) wallpapers per month</p>
                            </li>
                            <li>
                                <img src={pros} />
                                <p>Weekly Wallpapers</p>
                            </li>
                            <li>
                                <img src={pros} />
                                <p>Unlimited HD Downloads</p>
                            </li>
                        </ul>
                        <button className='button2 currentPlan'>Current Plan</button>
                    </div>
                </div>
                <div className={styles.plan}>
                    <h2>Premium</h2>
                    <p className={styles.price}>€1.99 <br /><span>Per Month</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li>
                                <img src={pros}/>
                                <p>Unlimited HD & 4K Downloads</p>
                            </li>
                            <li>
                                <img src={pros}/>
                                <p>60 Pixels per Month</p>
                            </li>
                            <li>
                                <img src={pros}/>
                                <p>Up to 20 (8K) Download per month</p>
                            </li>
                            <li>
                                <img src={pros}/>
                                <p>Includes all free plan features</p>
                            </li>
                        </ul>
                        <button className='button2'>Upgrade Now</button>
                    </div>
                </div>
                <div className={styles.plan}>
                <h2>Free</h2>
                    <p className={styles.price}>€2.99 <br /><span>Per Month</span></p>
                    <div className={styles.pros}>
                        <ul>
                            <li>
                                <img src={pros}/>
                                <p>Unlimited 8K Downloads</p>
                            </li>
                            <li>
                                <img src={pros}/>
                                <p>125 Pixels per month</p>
                            </li>
                            <li>
                                <img src={pros}/>
                                <p>Includes all Premium features</p>
                            </li>
                            <li>
                                <img src={pros}/>
                                <p>No Download limits</p>
                            </li>
                            <li>
                                <img src={pros}/>
                                <p>No Ads</p>
                            </li>
                        </ul>
                        <button className='button2'>Upgrade Now</button>
                    </div>
                </div>
            </div>
            <h1 className='mainH1'>Pixels</h1>
            <div className={styles.creditsContainer}>
                <form className={styles.creditsForm}>
                    <label>
                        <p>Current Pixels: {pixels}</p>
                        <input type='number' placeholder='Enter Pixels' />
                        <button className='button2'>Add Pixels</button>
                    </label>
                </form>
            </div>
        </div>
    );
}