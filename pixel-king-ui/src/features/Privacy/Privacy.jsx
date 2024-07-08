import React from 'react';
import styles from './Privacy.module.css';

const PrivacyPolicy = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Privacy Policy for Pixel King</h1>
            <p className={styles.paragraph}>
                Welcome to Pixel King. We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website www.pixel-king.com.
            </p>

            <h2 className={styles.header}>Information We Collect</h2>
            <h3 className={styles.header}>Personal Information</h3>
            <p className={styles.paragraph}>
                When you visit our website, we may collect the following personal information:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>Name</li>
                <li className={styles.listItem}>Email address</li>
                <li className={styles.listItem}>Phone number</li>
                <li className={styles.listItem}>Billing and shipping addresses</li>
                <li className={styles.listItem}>Payment information</li>
            </ul>

            <h3 className={styles.header}>Non-Personal Information</h3>
            <p className={styles.paragraph}>
                We may also collect non-personal information such as:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>Browser type</li>
                <li className={styles.listItem}>IP address</li>
                <li className={styles.listItem}>Pages visited</li>
                <li className={styles.listItem}>Time spent on each page</li>
                <li className={styles.listItem}>Referring URL</li>
            </ul>

            <h2 className={styles.header}>How We Use Your Information</h2>
            <p className={styles.paragraph}>
                We use the information we collect for various purposes, including:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>To process and fulfill your orders</li>
                <li className={styles.listItem}>To communicate with you about your order status and customer service inquiries</li>
                <li className={styles.listItem}>To send you promotional materials and newsletters (if you have opted-in)</li>
                <li className={styles.listItem}>To improve our website and services</li>
                <li className={styles.listItem}>To prevent fraudulent transactions and enhance security</li>
            </ul>

            <h2 className={styles.header}>Cookies and Tracking Technologies</h2>
            <p className={styles.paragraph}>
                Pixel King uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small data files stored on your device that help us understand how you use our website. You can control the use of cookies through your browser settings.
            </p>

            <h3 className={styles.header}>Types of Cookies We Use</h3>
            <ul className={styles.list}>
                <li className={styles.listItem}><strong>Essential Cookies</strong>: Necessary for the website to function properly.</li>
                <li className={styles.listItem}><strong>Performance Cookies</strong>: Help us understand how visitors interact with our website.</li>
                <li className={styles.listItem}><strong>Functional Cookies</strong>: Enhance the functionality and personalization of the website.</li>
                <li className={styles.listItem}><strong>Advertising Cookies</strong>: Used to deliver relevant advertisements to you.</li>
            </ul>

            <h2 className={styles.header}>Sharing Your Information</h2>
            <p className={styles.paragraph}>
                We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>To trusted third parties who assist us in operating our website and conducting our business, provided they agree to keep your information confidential.</li>
                <li className={styles.listItem}>To comply with legal requirements, enforce our site policies, or protect our or others' rights, property, or safety.</li>
            </ul>

            <h2 className={styles.header}>Data Security</h2>
            <p className={styles.paragraph}>
                We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers, and sensitive information is encrypted during transmission using Secure Socket Layer (SSL) technology.
            </p>

            <h2 className={styles.header}>Third-Party Links</h2>
            <p className={styles.paragraph}>
                Our website may contain links to third-party sites. We are not responsible for the privacy practices or the content of these external sites. We encourage you to read the privacy policies of any third-party sites you visit.
            </p>

            <h2 className={styles.header}>Your Rights</h2>
            <p className={styles.paragraph}>
                You have the right to:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>Access the personal information we hold about you.</li>
                <li className={styles.listItem}>Request the correction of inaccurate or incomplete data.</li>
                <li className={styles.listItem}>Request the deletion of your personal information.</li>
                <li className={styles.listItem}>Object to the processing of your personal data.</li>
                <li className={styles.listItem}>Withdraw your consent to our use of your information at any time.</li>
            </ul>

            <p className={styles.paragraph}>
                To exercise these rights, please contact us.
            </p>

            <h2 className={styles.header}>Changes to Our Privacy Policy</h2>
            <p className={styles.paragraph}>
                Pixel King reserves the right to update or change this Privacy Policy at any time. Any changes will be posted on this page with an updated revision date.
            </p>

            <h2 className={styles.header}>Contact Us</h2>
            <p className={styles.paragraph}>
                If you have any questions or concerns about this Privacy Policy, please contact us.
            </p>

            <p className={styles.paragraph}>
                Thank you for trusting Pixel King with your personal information. Your privacy is important to us.
            </p>

            <p className={styles.paragraph}>
                This Privacy Policy is effective as of Jul 8 2024.
            </p>
        </div>
    );
};

export default PrivacyPolicy;