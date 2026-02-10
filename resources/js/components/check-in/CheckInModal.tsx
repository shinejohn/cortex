import { router } from "@inertiajs/react";
import { Globe, Lock, MapPin, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventName: string;
    venueName: string;
}

export function CheckInModal({ isOpen, onClose, eventId, eventName, venueName }: CheckInModalProps) {
    const [notes, setNotes] = useState("");
    const [privacy, setPrivacy] = useState<"public" | "friends" | "private">("public");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await router.post(
                `/api/events/${eventId}/check-in`,
                {
                    notes,
                    is_public: privacy === "public",
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        onClose();
                        router.reload({ only: ["event"] });
                    },
                    onError: (errors) => {
                        console.error("Check-in failed:", errors);
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error("Check-in error:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-black tracking-tight">Check In</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                                <MapPin className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{venueName}</p>
                                <p className="text-sm text-muted-foreground">{eventName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">Add a note (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What's happening here?"
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Who can see this check-in?</Label>
                        <RadioGroup value={privacy} onValueChange={(value) => setPrivacy(value as "public" | "friends" | "private")} className="space-y-2">
                            <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                <RadioGroupItem value="public" id="public" />
                                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Public</span>
                                </Label>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                <RadioGroupItem value="friends" id="friends" />
                                <Label htmlFor="friends" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Friends</span>
                                </Label>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                <RadioGroupItem value="private" id="private" />
                                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Only Me</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Checking In...
                                </>
                            ) : (
                                "Check In"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
