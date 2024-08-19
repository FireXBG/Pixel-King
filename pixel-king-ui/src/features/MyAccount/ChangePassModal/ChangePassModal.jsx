import styles from './ChangePassModal.module.css';

export default function ChangePasswordModal({ onClose }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Change Password</h2>
                <form>
                    <label>
                        Current Password:
                        <input type="password" name="currentPassword" />
                    </label>
                    <label>
                        New Password:
                        <input type="password" name="newPassword" />
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