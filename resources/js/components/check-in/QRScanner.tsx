import { Html5Qrcode } from "html5-qrcode";
import { Check, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

interface ScanResult {
    success: boolean;
    error?: string;
    ticket?: { id: string; event?: { title: string }; plan?: { name: string } };
}

interface QRScannerProps {
    onScan: (result: ScanResult) => void;
    eventId?: string;
}

export function QRScanner({ onScan }: QRScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isScanningRef = useRef(false);
    const mountedRef = useRef(true);

    const stopScanner = useCallback(async () => {
        isScanningRef.current = false;
        if (scannerRef.current?.isScanning()) {
            await scannerRef.current.stop();
        }
        scannerRef.current = null;
        setScanning(false);
    }, []);

    const startScanner = useCallback(async () => {
        if (!containerRef.current || !mountedRef.current) return;
        if (isScanningRef.current) return;
        isScanningRef.current = true;

        try {
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await stopScanner();
                    try {
                        const res = await axios.post("/api/check-in/scan", {
                            ticket_code: decodedText,
                        });
                        const data = res.data;
                        setLastResult({
                            success: data.success,
                            message: data.success ? "Check-in successful!" : (data.error ?? "Unknown error"),
                        });
                        onScan(data);
                        setTimeout(() => {
                            if (!mountedRef.current) return;
                            setLastResult(null);
                            startScanner();
                        }, 2000);
                    } catch (err) {
                        setLastResult({ success: false, message: "Scan failed" });
                        onScan({ success: false, error: "Scan failed" });
                        setTimeout(() => {
                            if (!mountedRef.current) return;
                            setLastResult(null);
                            startScanner();
                        }, 2000);
                    }
                },
                () => {}
            );
            setScanning(true);
        } catch (err) {
            isScanningRef.current = false;
            setLastResult({ success: false, message: "Could not start camera" });
        }
    }, [onScan, stopScanner]);

    useEffect(() => {
        mountedRef.current = true;
        startScanner();

        return () => {
            mountedRef.current = false;
            stopScanner();
        };
    }, [startScanner, stopScanner]);

    return (
        <div className="relative" ref={containerRef}>
            <div id="qr-reader" className="rounded-lg overflow-hidden" />
            {lastResult && (
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg ${
                        lastResult.success ? "text-green-400" : "text-red-400"
                    }`}
                >
                    {lastResult.success ? (
                        <Check className="h-16 w-16 mb-2" />
                    ) : (
                        <X className="h-16 w-16 mb-2" />
                    )}
                    <span className="font-medium">{lastResult.message}</span>
                </div>
            )}
        </div>
    );
}
