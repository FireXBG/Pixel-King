import styles from './layout.module.css';
import Login from "./Login/Login";
import Register from "./Register/Register";
import dog from '../../assets/dog.png';
import {Link} from "react-router-dom";

export default function UserLayout({ view }) {
    return (
        <>
            <img src={dog} className={styles.image} alt="Dog" />
            <div className={styles.content}>
                {view === 'login' && <Login />}
                {view === 'register' && <Register />}
            </div>
            <Link className={styles.goBack} to='/'>Go back</Link>
        </>
    );
}