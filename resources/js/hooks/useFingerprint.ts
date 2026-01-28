import { useEffect, useState } from 'react';

export function useFingerprint() {
    const [fingerprint, setFingerprint] = useState<string>('');

    useEffect(() => {
        // Simple canvas fingerprinting or similar 
        // For MVP, we can just generate a random ID and store in localStorage
        const stored = localStorage.getItem('voter_device_id');
        if (stored) {
            setFingerprint(stored);
        } else {
            const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('voter_device_id', newId);
            setFingerprint(newId);
        }
    }, []);

    return fingerprint;
}
