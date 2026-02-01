import { router } from "@inertiajs/react";
import { Bell, CheckCircle2, Smartphone } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface NotificationSubscribeProps {
    platform: "daynews" | "goeventcity" | "downtownguide" | "alphasite";
    communityId: string;
    initialSubscriptions?: Array<{
        id: string;
        platform: string;
        community_id: string;
        phone_verified: boolean;
        web_push_endpoint: string | null;
        notification_types: string[];
        status: string;
    }>;
}

export default function NotificationSubscribe({ platform, communityId, initialSubscriptions = [] }: NotificationSubscribeProps) {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [step, setStep] = useState<"initial" | "verify" | "complete">("initial");
    const [preferences, setPreferences] = useState({
        breaking_news: true,
        events: true,
        deals: true,
    });
    const [vapidKey, setVapidKey] = useState<string | null>(null);

    const fetchVapidKey = useCallback(async () => {
        try {
            const response = await fetch("/api/notifications/vapid-key");
            const data = await response.json();
            setVapidKey(data.publicKey);
        } catch (error) {
            console.error("Failed to fetch VAPID key:", error);
        }
    }, []);

    const checkExistingSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error("Error checking subscription:", error);
        }
    }, []);

    useEffect(() => {
        // Check if push notifications are supported
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            checkExistingSubscription();
            fetchVapidKey();
        }
    }, [checkExistingSubscription, fetchVapidKey]);

    const subscribeToPush = async () => {
        setIsLoading(true);
        try {
            if (!vapidKey) {
                await fetchVapidKey();
            }

            // Register service worker if not already registered
            const registration = await navigator.serviceWorker.register("/service-worker.js");
            await navigator.serviceWorker.ready;

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey!),
            });

            const subscriptionJson = subscription.toJSON();

            // Send subscription to server
            await router.post("/api/notifications/web-push/register", {
                platform,
                community_id: communityId,
                endpoint: subscriptionJson.endpoint,
                keys: subscriptionJson.keys,
                notification_types: Object.keys(preferences).filter((k) => preferences[k as keyof typeof preferences]),
            });

            setIsSubscribed(true);
            toast.success("Browser notifications enabled successfully");
        } catch (error) {
            console.error("Push subscription failed:", error);
            toast.error("Failed to enable notifications. Please try again.");
        }
        setIsLoading(false);
    };

    const requestSMSVerification = async () => {
        if (!phoneNumber.match(/^\+1[0-9]{10}$/)) {
            toast.error("Please enter a valid US phone number (+1XXXXXXXXXX)");
            return;
        }

        setIsLoading(true);
        try {
            await router.post("/api/notifications/sms/request-verification", {
                phone_number: phoneNumber,
                platform,
            });
            setStep("verify");
        } catch (error: unknown) {
            const message =
                error &&
                typeof error === "object" &&
                "response" in error &&
                error.response &&
                typeof error.response === "object" &&
                "data" in error.response &&
                error.response.data &&
                typeof error.response.data === "object" &&
                "message" in error.response.data
                    ? String(error.response.data.message)
                    : "Failed to send verification code";
            toast.error(message);
        }
        setIsLoading(false);
    };

    const verifySMSAndSubscribe = async () => {
        setIsLoading(true);
        try {
            await router.post("/api/notifications/sms/verify-and-subscribe", {
                phone_number: phoneNumber,
                code: verificationCode,
                platform,
                community_id: communityId,
                notification_types: Object.keys(preferences).filter((k) => preferences[k as keyof typeof preferences]),
            });
            setStep("complete");
            toast.success("SMS notifications enabled successfully");
        } catch (error: unknown) {
            const message =
                error &&
                typeof error === "object" &&
                "response" in error &&
                error.response &&
                typeof error.response === "object" &&
                "data" in error.response &&
                error.response.data &&
                typeof error.response.data === "object" &&
                "message" in error.response.data
                    ? String(error.response.data.message)
                    : "Invalid verification code";
            toast.error(message);
        }
        setIsLoading(false);
    };

    // Helper function to convert VAPID key
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    return (
        <div className="notification-subscribe p-6 bg-white rounded-lg shadow-lg border">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Get Notified
            </h3>

            {/* Notification Type Preferences */}
            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">What would you like to receive?</p>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={preferences.breaking_news}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, breaking_news: checked === true })}
                        />
                        <span>Breaking News</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={preferences.events}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, events: checked === true })}
                        />
                        <span>Local Events</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={preferences.deals}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, deals: checked === true })}
                        />
                        <span>Deals & Offers</span>
                    </label>
                </div>
            </div>

            {/* Browser Push Section */}
            {isSupported && (
                <div className="mb-6 pb-6 border-b">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Browser Notifications
                    </h4>
                    {isSubscribed ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Browser notifications enabled</span>
                        </div>
                    ) : (
                        <Button onClick={subscribeToPush} disabled={isLoading || !vapidKey} className="w-full">
                            {isLoading ? "Enabling..." : "Enable Browser Notifications"}
                        </Button>
                    )}
                </div>
            )}

            {/* SMS Section */}
            <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    SMS Notifications
                </h4>

                {step === "initial" && (
                    <div className="flex gap-2">
                        <Input
                            type="tel"
                            placeholder="+1 (312) 555-1234"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+]/g, ""))}
                            className="flex-1"
                        />
                        <Button onClick={requestSMSVerification} disabled={isLoading || !phoneNumber.match(/^\+1[0-9]{10}$/)}>
                            {isLoading ? "Sending..." : "Verify"}
                        </Button>
                    </div>
                )}

                {step === "verify" && (
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Enter the 6-digit code sent to {phoneNumber}</p>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="123456"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="w-32"
                                maxLength={6}
                            />
                            <Button onClick={verifySMSAndSubscribe} disabled={isLoading || verificationCode.length !== 6}>
                                {isLoading ? "Verifying..." : "Subscribe"}
                            </Button>
                        </div>
                    </div>
                )}

                {step === "complete" && (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>SMS notifications enabled for {phoneNumber}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
