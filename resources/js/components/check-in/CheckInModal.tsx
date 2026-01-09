import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Globe, Users, Lock } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Check In</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="flex items-center text-gray-800 font-medium mb-2">
                            <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                            <span>{venueName}</span>
                        </div>
                        <div className="ml-7 text-sm text-gray-600">{eventName}</div>
                    </div>

                    <div>
                        <Label htmlFor="notes">Add a note (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What's happening here?"
                            rows={3}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>Who can see this check-in?</Label>
                        <RadioGroup value={privacy} onValueChange={(value) => setPrivacy(value as "public" | "friends" | "private")} className="mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="public" id="public" />
                                <Label htmlFor="public" className="flex items-center cursor-pointer">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Public
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="friends" id="friends" />
                                <Label htmlFor="friends" className="flex items-center cursor-pointer">
                                    <Users className="h-4 w-4 mr-2" />
                                    Friends
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="private" id="private" />
                                <Label htmlFor="private" className="flex items-center cursor-pointer">
                                    <Lock className="h-4 w-4 mr-2" />
                                    Only Me
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Checking In..." : "Check In"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
