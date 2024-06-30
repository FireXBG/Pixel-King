import styles from './License.module.css';

function License(){
    return (
        <div className={styles.licenseContainer}>
            <h1 className={styles.title}>Wallpaper Usage License Agreement</h1>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Introduction</h2>
                <p className={styles.text}>
                    This Wallpaper Usage License Agreement ("Agreement") is a legal agreement between you ("User") and Carica LTD ("Company") for the use of the wallpapers available on Pixel King ("Website"). By downloading or using any wallpaper from the Website, you agree to be bound by the terms and conditions of this Agreement.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>2. License Grant</h2>
                <p className={styles.text}><strong>2.1 Personal Use:</strong> The Company grants the User a non-exclusive, non-transferable, and revocable license to download, display, and use the wallpapers for personal, non-commercial purposes only.</p>
                <p className={styles.text}><strong>2.2 Prohibited Use:</strong> The User is expressly prohibited from using the wallpapers for any commercial purposes. This includes but is not limited to:</p>
                <ul className={styles.list}>
                    <li>Selling or distributing the wallpapers for profit.</li>
                    <li>Using the wallpapers in any form of advertising or marketing materials.</li>
                    <li>Incorporating the wallpapers into products intended for sale or distribution.</li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>3. Ownership and Intellectual Property Rights</h2>
                <p className={styles.text}><strong>3.1 Ownership:</strong> All wallpapers provided on the Website are the exclusive property of the Company. The Company retains all rights, title, and interest in and to the wallpapers, including all intellectual property rights.</p>
                <p className={styles.text}><strong>3.2 Copyright Notice:</strong> The User must retain all copyright and other proprietary notices contained in the original wallpapers.</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>4. Ads and Monetization</h2>
                <p className={styles.text}><strong>4.1 Ad-Supported Service:</strong> The Website is supported by advertisements. By using the Website and downloading wallpapers, the User agrees to view and interact with ads as part of the service.</p>
                <p className={styles.text}><strong>4.2 Ad Blockers:</strong> The use of ad blockers or any other technology to circumvent the display of advertisements on the Website is prohibited.</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>5. Restrictions</h2>
                <p className={styles.text}><strong>5.1 Modification:</strong> The User may not alter, modify, or create derivative works of the wallpapers without prior written consent from the Company.</p>
                <p className={styles.text}><strong>5.2 Redistribution:</strong> The User may not redistribute, sublicense, or otherwise transfer any rights to the wallpapers to any third party.</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>6. Termination</h2>
                <p className={styles.text}><strong>6.1 Termination by Company:</strong> The Company reserves the right to terminate this Agreement and the User’s access to the wallpapers at any time, without notice, for any reason, including but not limited to the User's violation of any terms of this Agreement.</p>
                <p className={styles.text}><strong>6.2 Effect of Termination:</strong> Upon termination, the User must immediately cease all use of the wallpapers and destroy all copies, full or partial, in the User’s possession or control.</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>7. Disclaimer of Warranties</h2>
                <p className={styles.text}>
                    The wallpapers are provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. The Company does not warrant that the wallpapers will meet the User’s requirements or that the operation of the Website will be uninterrupted or error-free.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>8. Limitation of Liability</h2>
                <p className={styles.text}>
                    In no event shall the Company be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of or inability to use the wallpapers, even if the Company has been advised of the possibility of such damages.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>9. General Provisions</h2>
                <p className={styles.text}><strong>9.1 Governing Law:</strong> This Agreement shall be governed by and construed in accordance with the laws of Bulgaria, without regard to its conflict of law principles.</p>
                <p className={styles.text}><strong>9.2 Entire Agreement:</strong> This Agreement constitutes the entire agreement between the User and the Company regarding the use of the wallpapers and supersedes all prior agreements and understandings, whether written or oral, relating to the subject matter hereof.</p>
                <p className={styles.text}><strong>9.3 Amendments:</strong> The Company reserves the right to modify this Agreement at any time. The User’s continued use of the Website and wallpapers following any such modification constitutes the User’s acceptance of the modified Agreement.</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>10. Contact Information</h2>
                <p className={styles.text}>
                    If you have any questions about this Agreement, please contact us at:
                </p>
                <address className={styles.text}>
                    Carica LTD<br/>
                    Bulgaria<br/>
                    Email: caricapd@gmail.com
                </address>
            </section>

            <p className={styles.text}>
                By using the Website and downloading wallpapers, you acknowledge that you have read, understood, and agreed to be bound by the terms and conditions of this Agreement.
            </p>
        </div>
    );
}

export default License;