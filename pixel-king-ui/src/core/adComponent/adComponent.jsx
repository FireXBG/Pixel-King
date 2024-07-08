import React, { useEffect } from 'react';

const AdComponent = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('Adsbygoogle error', e);
        }
    }, []);

    return (
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-8604017286006965"
             data-ad-slot="4502461871"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    );
};

export default AdComponent;
