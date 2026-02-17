import { router } from "@inertiajs/react";
import { MapPinIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;

interface NearMeSliderProps {
    currentRadius?: number;
    currentLat?: number;
    currentLng?: number;
}

export function NearMeSlider({ currentRadius = 25, currentLat, currentLng }: NearMeSliderProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNearMe = () => {
        setError(null);
        setLoading(true);
        if (!navigator.geolocation) {
            setError("Geolocation is not supported");
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                router.get(route("events") as string, { lat, lng, radius: currentRadius }, {
                    preserveState: true,
                    onFinish: () => setLoading(false),
                });
            },
            () => {
                setError("Could not get your location");
                setLoading(false);
            }
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                onClick={handleNearMe}
                disabled={loading}
            >
                <MapPinIcon className="h-4 w-4 mr-1" />
                {loading ? "Getting location…" : "Near Me"}
            </Button>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Within:</span>
                <select
                    className="text-sm border rounded px-2 py-1 bg-background"
                    value={currentRadius}
                    onChange={(e) => {
                        const radius = Number(e.target.value);
                        const params: Record<string, string | number> = { radius };
                        if (currentLat != null && currentLng != null) {
                            params.lat = currentLat;
                            params.lng = currentLng;
                        }
                        router.get(route("events") as string, params, { preserveState: true });
                    }}
                >
                    {RADIUS_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                            {r} mi
                        </option>
                    ))}
                </select>
            </div>
            {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
    );
}
