import styles from './ChangeInfoModal.module.css';

export default function ChangeInfoModal({ onClose }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Change Info</h2>
                <form>
                    <label>
                        Username:
                        <input type="text" name="username"/>
                    </label>
                    <label>
                        Email:
                        <input type="email" name="email"/>
                    </label>
                    <div className={styles.buttonsWrapper}>
                        <button type="submit" className='button2'>Save Changes</button>
                        <button type="button" onClick={onClose} className='button2'>Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}