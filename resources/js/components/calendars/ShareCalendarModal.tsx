import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareCalendarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    calendarTitle: string;
    feedUrl: string | null;
    pageUrl: string;
}

export function ShareCalendarModal({
    open,
    onOpenChange,
    calendarTitle,
    feedUrl,
    pageUrl,
}: ShareCalendarModalProps) {
    const [copiedField, setCopiedField] = useState<"page" | "feed" | null>(null);

    const copyToClipboard = async (text: string, field: "page" | "feed") => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share {calendarTitle}</DialogTitle>
                    <DialogDescription>
                        Share this calendar with others. Use the iCal feed URL to subscribe in Apple Calendar, Google
                        Calendar, or Outlook.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="page-url">Calendar page URL</Label>
                        <div className="flex gap-2">
                            <Input id="page-url" readOnly value={pageUrl} className="font-mono text-sm" />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(pageUrl, "page")}
                                title="Copy page URL"
                            >
                                {copiedField === "page" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    {feedUrl && (
                        <div className="space-y-2">
                            <Label htmlFor="feed-url">iCal feed URL (subscribe in calendar apps)</Label>
                            <div className="flex gap-2">
                                <Input id="feed-url" readOnly value={feedUrl} className="font-mono text-sm" />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(feedUrl, "feed")}
                                    title="Copy feed URL"
                                >
                                    {copiedField === "feed" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Add this URL in Apple Calendar (File → New Calendar Subscription), Google Calendar
                                (Settings → Add calendar → From URL), or Outlook.
                            </p>
                        </div>
                    )}
                    {!feedUrl && (
                        <p className="text-sm text-muted-foreground">
                            This calendar is private. iCal feed is only available for public calendars.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
