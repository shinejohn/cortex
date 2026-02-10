import { Head, useForm, usePage } from "@inertiajs/react";
import { CheckCircle2, Mail, MailX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EmailSubscriber {
    id: number;
    uuid: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    type: string;
    status: string;
    community_id: string | null;
    preferences: Record<string, boolean> | null;
    unsubscribed_at: string | null;
}

interface UnsubscribePageProps {
    subscriber: EmailSubscriber;
    flash?: {
        success?: string;
    };
}

export default function Unsubscribe() {
    const { subscriber, flash } = usePage<UnsubscribePageProps>().props;

    const form = useForm({
        reason: "",
    });

    const isAlreadyUnsubscribed = subscriber.status === "unsubscribed";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("email.unsubscribe.process", subscriber.id) as any);
    };

    const displayName = subscriber.first_name
        ? `${subscriber.first_name}${subscriber.last_name ? ` ${subscriber.last_name}` : ""}`
        : null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <Head title="Unsubscribe" />

            <div className="w-full max-w-md">
                <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                    {/* Header */}
                    <div className="bg-zinc-900 px-8 py-8 text-center text-white">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-white/10">
                            {isAlreadyUnsubscribed || flash?.success ? (
                                <CheckCircle2 className="size-7" />
                            ) : (
                                <MailX className="size-7" />
                            )}
                        </div>
                        <h1 className="text-xl font-bold">
                            {isAlreadyUnsubscribed || flash?.success
                                ? "You're Unsubscribed"
                                : "Unsubscribe"}
                        </h1>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-8">
                        {isAlreadyUnsubscribed || flash?.success ? (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    {displayName ? (
                                        <>
                                            <span className="font-semibold text-foreground">{displayName}</span>,
                                            you have been successfully unsubscribed.
                                        </>
                                    ) : (
                                        "You have been successfully unsubscribed."
                                    )}
                                </p>
                                <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="size-4" />
                                        <span className="font-medium">{subscriber.email}</span>
                                    </div>
                                </div>
                                <p className="mt-6 text-xs text-muted-foreground">
                                    You will no longer receive emails from us at this address.
                                    It may take up to 24 hours for changes to fully take effect.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="mb-2 text-center text-sm text-muted-foreground">
                                    You are about to unsubscribe the following email:
                                </p>
                                <div className="mb-6 rounded-xl bg-zinc-50 p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <Mail className="size-4 text-muted-foreground" />
                                        <span className="font-semibold">{subscriber.email}</span>
                                    </div>
                                    {subscriber.type && (
                                        <p className="mt-1 text-xs text-muted-foreground capitalize">
                                            Subscription type: {subscriber.type.replace(/_/g, " ")}
                                        </p>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="reason" className="text-sm font-medium">
                                            Reason for unsubscribing (optional)
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            className="min-h-[80px] resize-none rounded-xl border-zinc-200 text-sm"
                                            placeholder="Let us know why you're leaving..."
                                            value={form.data.reason}
                                            onChange={(e) => form.setData("reason", e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={form.processing}
                                        className="w-full rounded-xl font-semibold"
                                    >
                                        {form.processing
                                            ? "Processing..."
                                            : "Confirm Unsubscribe"}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t bg-zinc-50 px-8 py-4 text-center">
                        <p className="text-xs text-muted-foreground">
                            Changed your mind?{" "}
                            <a
                                href={route("email.preferences", subscriber.id) as any}
                                className="font-medium text-primary hover:underline"
                            >
                                Manage preferences instead
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
