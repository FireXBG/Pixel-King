import styles from './Contact.module.css';

function Contact() {
    return (
        <div>
            <h1 className={styles.mainH1}>CONTACT US</h1>
            <div className={styles.contacts__wrapper}>
                <div className={styles.info__container}>
                    <h2>Empowering Creativity, One Pixel at a Time</h2>
                    <p>Email: example@ecample.com</p>
                    <p>Social: </p>
                </div>
                <form className={styles.form} action={`${process.env.REACT_APP_BACKEND_URL}/admin/contact`} method="POST">
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" name="name"></input>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email"></input>
                    <label htmlFor="message">Message:</label>
                    <textarea id="message" name="message"></textarea>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Contact;
