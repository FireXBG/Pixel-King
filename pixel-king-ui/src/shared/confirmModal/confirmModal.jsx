import styles from './confirmModal.module.css';

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className={styles.buttons}>
                    <button className='button2' onClick={onCancel}>Cancel</button>
                    <button className='button2' onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
}
