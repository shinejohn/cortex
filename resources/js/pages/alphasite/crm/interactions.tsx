import { Head, Link, router } from "@inertiajs/react";
import {
    MessageSquare,
    Search,
    Phone,
    Mail,
    Star,
    Calendar,
    ChevronRight,
    Filter,
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    Clock,
} from "lucide-react";
import Layout from "@/layouts/layout";
import { useState } from "react";

interface Business {
    id: string;
    name: string;
    slug: string;
}

interface Interaction {
    id: string;
    type: string;
    channel?: string;
    summary: string;
    notes?: string;
    customer_name?: string;
    customer_id?: string;
    created_at: string;
}

interface CallRecord {
    id: string;
    phone_number?: string;
    direction: "inbound" | "outbound";
    status: "answered" | "missed" | "voicemail";
    duration_seconds?: number;
    recording_url?: string;
    transcript?: string;
    created_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    business: Business;
    interactions: {
        data: Interaction[];
        links: PaginationLinks[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    callHistory: CallRecord[] | { data: CallRecord[] };
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTypeIcon(type: string) {
    switch (type) {
        case "call":
            return Phone;
        case "email":
            return Mail;
        case "review":
            return Star;
        default:
            return MessageSquare;
    }
}

function getCallStatusIcon(status: string) {
    switch (status) {
        case "answered":
            return PhoneIncoming;
        case "missed":
            return PhoneMissed;
        default:
            return PhoneOutgoing;
    }
}

export default function CrmInteractions({ business, interactions, callHistory }: Props) {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"interactions" | "calls">("interactions");

    const callRecords = Array.isArray(callHistory) ? callHistory : callHistory?.data ?? [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get("/crm/interactions", { search }, { preserveState: true, preserveScroll: true });
    };

    return (
        <Layout>
            <Head>
                <title>Interactions - {business.name} CRM - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 lg:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
                            <Link href="/crm" className="hover:text-white transition-colors">
                                CRM
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span>Interactions</span>
                        </div>
                        <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">Interactions</h1>
                        <p className="text-blue-100/90 mt-2">
                            Track all customer interactions and AI call history for {business.name}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 max-w-md">
                        <button
                            onClick={() => setActiveTab("interactions")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "interactions"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Interactions
                        </button>
                        <button
                            onClick={() => setActiveTab("calls")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "calls"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Phone className="h-4 w-4" />
                            AI Calls
                            {callRecords.length > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                                    {callRecords.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search Bar */}
                    {activeTab === "interactions" && (
                        <form onSubmit={handleSearch} className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search interactions..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                />
                            </div>
                        </form>
                    )}

                    {/* Interactions Tab */}
                    {activeTab === "interactions" && (
                        <div className="space-y-4">
                            {interactions.data.length > 0 ? (
                                <>
                                    {interactions.data.map((interaction) => {
                                        const IconComponent = getTypeIcon(interaction.type);
                                        return (
                                            <div
                                                key={interaction.id}
                                                className="bg-card rounded-2xl border-none shadow-sm p-5 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 shrink-0">
                                                        <IconComponent className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                                                                {interaction.type}
                                                            </span>
                                                            {interaction.channel && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full capitalize">
                                                                    {interaction.channel}
                                                                </span>
                                                            )}
                                                            {interaction.customer_name && (
                                                                <Link
                                                                    href={`/crm/customers/${interaction.customer_id}`}
                                                                    className="text-sm text-primary font-medium hover:underline"
                                                                >
                                                                    {interaction.customer_name}
                                                                </Link>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-foreground">{interaction.summary}</p>
                                                        {interaction.notes && (
                                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                                {interaction.notes}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(interaction.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Pagination */}
                                    {interactions.links && interactions.links.length > 3 && (
                                        <div className="mt-8 flex justify-center">
                                            <nav className="flex gap-1.5">
                                                {interactions.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || "#"}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            link.active
                                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                                : "bg-card text-foreground hover:bg-muted border"
                                                        } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                        <MessageSquare className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Interactions Yet</h3>
                                    <p className="text-muted-foreground">
                                        Interactions will appear here as customers engage with your business.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Calls Tab */}
                    {activeTab === "calls" && (
                        <div className="space-y-4">
                            {callRecords.length > 0 ? (
                                callRecords.map((call) => {
                                    const StatusIcon = getCallStatusIcon(call.status);
                                    return (
                                        <div
                                            key={call.id}
                                            className="bg-card rounded-2xl border-none shadow-sm p-5 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`flex items-center justify-center h-11 w-11 rounded-xl shrink-0 ${
                                                        call.status === "answered"
                                                            ? "bg-emerald-50 dark:bg-emerald-950"
                                                            : call.status === "missed"
                                                              ? "bg-red-50 dark:bg-red-950"
                                                              : "bg-muted"
                                                    }`}
                                                >
                                                    <StatusIcon
                                                        className={`h-5 w-5 ${
                                                            call.status === "answered"
                                                                ? "text-emerald-600"
                                                                : call.status === "missed"
                                                                  ? "text-red-500"
                                                                  : "text-muted-foreground"
                                                        }`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${
                                                                call.status === "answered"
                                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                                                    : call.status === "missed"
                                                                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                                                      : "bg-muted text-muted-foreground"
                                                            }`}
                                                        >
                                                            {call.status}
                                                        </span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full capitalize">
                                                            {call.direction}
                                                        </span>
                                                        {call.phone_number && (
                                                            <span className="text-sm text-foreground font-medium">
                                                                {call.phone_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {call.transcript && (
                                                        <p className="text-sm text-foreground mt-1 line-clamp-2">{call.transcript}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(call.created_at).toLocaleString()}
                                                        </span>
                                                        {call.duration_seconds !== undefined && call.duration_seconds > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDuration(call.duration_seconds)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                        <Phone className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Call History</h3>
                                    <p className="text-muted-foreground">
                                        AI call records will appear here once you set up 4Calls.ai integration.
                                    </p>
                                    <Link
                                        href="/crm/ai-services"
                                        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Set Up AI Services
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
