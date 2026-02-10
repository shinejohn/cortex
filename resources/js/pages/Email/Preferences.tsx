import { Head, useForm, usePage } from "@inertiajs/react";
import { Bell, CheckCircle2, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface EmailSubscriber {
    id: number;
    uuid: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    type: string;
    status: string;
    community_id: string | null;
    preferences: {
        daily_digest?: boolean;
        breaking_news?: boolean;
        weekly_newsletter?: boolean;
    } | null;
}

interface PreferencesPageProps {
    subscriber: EmailSubscriber;
    flash?: {
        success?: string;
    };
}

interface PreferenceOption {
    key: "daily_digest" | "breaking_news" | "weekly_newsletter";
    label: string;
    description: string;
    icon: typeof Mail;
}

export default function Preferences() {
    const { subscriber, flash } = usePage<PreferencesPageProps>().props;

    const preferenceOptions: PreferenceOption[] = [
        {
            key: "daily_digest",
            label: "Daily Digest",
            description: "A daily summary of the top stories and updates from your community.",
            icon: Mail,
        },
        {
            key: "breaking_news",
            label: "Breaking News",
            description: "Immediate alerts for urgent or important news in your area.",
            icon: Bell,
        },
        {
            key: "weekly_newsletter",
            label: "Weekly Newsletter",
            description: "A curated weekly roundup of community stories, events, and highlights.",
            icon: Mail,
        },
    ];

    const form = useForm({
        preferences: {
            daily_digest: subscriber.preferences?.daily_digest ?? true,
            breaking_news: subscriber.preferences?.breaking_news ?? true,
            weekly_newsletter: subscriber.preferences?.weekly_newsletter ?? false,
        },
    });

    const handleToggle = (key: PreferenceOption["key"]) => {
        form.setData("preferences", {
            ...form.data.preferences,
            [key]: !form.data.preferences[key],
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route("email.preferences.update", subscriber.id) as any);
    };

    const displayName = subscriber.first_name
        ? `${subscriber.first_name}${subscriber.last_name ? ` ${subscriber.last_name}` : ""}`
        : null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
            <Head title="Email Preferences" />

            <div className="w-full max-w-lg">
                <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                    {/* Header */}
                    <div className="bg-zinc-900 px-8 py-8 text-center text-white">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-white/10">
                            <Settings className="size-7" />
                        </div>
                        <h1 className="text-xl font-bold">Email Preferences</h1>
                        {displayName && (
                            <p className="mt-1 text-sm text-white/70">
                                for {displayName}
                            </p>
                        )}
                    </div>

                    {/* Success Flash */}
                    {flash?.success && (
                        <div className="mx-8 mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                            <CheckCircle2 className="size-5 flex-shrink-0 text-green-600" />
                            <span className="font-medium">{flash.success}</span>
                        </div>
                    )}

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="px-8 py-8">
                        <div className="mb-6 rounded-xl bg-zinc-50 p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <Mail className="size-4 text-muted-foreground" />
                                <span className="font-semibold">{subscriber.email}</span>
                            </div>
                        </div>

                        <p className="mb-6 text-sm text-muted-foreground">
                            Choose which emails you would like to receive. Toggle on or off
                            to customize your experience.
                        </p>

                        <div className="space-y-4">
                            {preferenceOptions.map((option) => {
                                const isActive = form.data.preferences[option.key];
                                const IconComponent = option.icon;

                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => handleToggle(option.key)}
                                        className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                                            isActive
                                                ? "border-primary/30 bg-primary/5"
                                                : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                                        }`}
                                    >
                                        <div
                                            className={`mt-0.5 flex size-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                isActive
                                                    ? "bg-primary text-white"
                                                    : "bg-zinc-200 text-zinc-500"
                                            }`}
                                        >
                                            <IconComponent className="size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold cursor-pointer">
                                                    {option.label}
                                                </Label>
                                                {/* Toggle Indicator */}
                                                <div
                                                    className={`relative h-6 w-11 rounded-full transition-colors ${
                                                        isActive ? "bg-primary" : "bg-zinc-300"
                                                    }`}
                                                >
                                                    <div
                                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                                            isActive
                                                                ? "translate-x-5"
                                                                : "translate-x-0.5"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                                {option.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="mt-8 w-full rounded-xl font-semibold"
                        >
                            {form.processing ? "Saving..." : "Save Preferences"}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="border-t bg-zinc-50 px-8 py-4 text-center">
                        <p className="text-xs text-muted-foreground">
                            Want to stop all emails?{" "}
                            <a
                                href={route("email.unsubscribe", subscriber.id) as any}
                                className="font-medium text-destructive hover:underline"
                            >
                                Unsubscribe from all
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
