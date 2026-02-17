import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FlagIcon } from "lucide-react";

const COMPLAINT_REASONS = [
    { value: "hate_speech", label: "Hate Speech or Discrimination" },
    { value: "threats", label: "Threats of Violence" },
    { value: "spam", label: "Spam or Promotional Content" },
    { value: "misinformation", label: "Misinformation" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "pii", label: "Personal Information Exposure" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "other", label: "Other" },
];

interface ReportContentModalProps {
    contentType: string;
    contentId: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    onError?: (message: string) => void;
}

export default function ReportContentModal({
    contentType,
    contentId,
    trigger,
    onSuccess,
    onError,
}: ReportContentModalProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>("");
    const [complaintText, setComplaintText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;

        setIsSubmitting(true);
        try {
            const baseUrl = "/api/v1";
            await axios.post(
                `${baseUrl}/moderation/${contentType}/${contentId}/complaint`,
                { reason, complaint_text: complaintText || undefined },
                { withCredentials: true, headers: { Accept: "application/json" } }
            );
            setOpen(false);
            setReason("");
            setComplaintText("");
            onSuccess?.();
        } catch (err: unknown) {
            const msg =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? String(err.response.data.message)
                    : "Failed to submit complaint.";
            onError?.(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <FlagIcon className="mr-1 size-4" />
                        Report
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Report Content</DialogTitle>
                        <DialogDescription>
                            Report this content if you believe it violates our Content Standards Policy.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="reason">Reason</Label>
                            <Select value={reason} onValueChange={setReason} required>
                                <SelectTrigger id="reason">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMPLAINT_REASONS.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="complaint_text">Additional details (optional)</Label>
                            <Textarea
                                id="complaint_text"
                                value={complaintText}
                                onChange={(e) => setComplaintText(e.target.value)}
                                placeholder="Tell us more about your concern"
                                maxLength={500}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!reason || isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
