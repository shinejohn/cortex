import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";
import { route } from "ziggy-js";
import Layout from "@/layouts/layout";

/* ──────────────────────────────────────────────
   Type Definitions
   ────────────────────────────────────────────── */

interface BusinessDomain {
    id: string;
    domain_name: string;
    domain_source: "purchased" | "external";
    status:
        | "pending_purchase"
        | "purchased"
        | "pending_dns"
        | "active"
        | "dns_error"
        | "expired"
        | "transferred_out";
    purchase_price: number | null;
    purchase_currency: string;
    dns_check_method: string;
    dns_instructions: {
        method: string;
        summary: string;
        steps: string[];
        record_type: string;
        record_name: string;
        record_value: string;
        fallback_type?: string;
        fallback_value?: string;
    } | null;
    is_primary: boolean;
    auto_renew: boolean;
    dns_verified_at: string | null;
    ssl_provisioned_at: string | null;
    last_dns_check_at: string | null;
    registration_date: string | null;
    expiration_date: string | null;
    dns_checks_count: number;
    created_at: string;
}

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        city: string | null;
    };
    domains: BusinessDomain[];
    alphasiteSubdomain: string;
}

interface SearchResult {
    domain: string;
    available: boolean;
    price: number | null;
    currency: string;
}

interface ChatMessage {
    role: "assistant" | "user";
    content: string;
}

/* ──────────────────────────────────────────────
   Helper Components
   ────────────────────────────────────────────── */

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
            {children}
        </div>
    );
}

function StatusBadge({ status, onCheckNow }: { status: BusinessDomain["status"]; onCheckNow?: () => void }) {
    const configs: Record<string, { label: string; classes: string; pulse?: boolean }> = {
        active: { label: "Live", classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        pending_dns: {
            label: "Waiting for DNS...",
            classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            pulse: true,
        },
        purchased: {
            label: "Setting up...",
            classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        },
        pending_purchase: {
            label: "Pending Purchase",
            classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        },
        dns_error: {
            label: "DNS Error",
            classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        },
        expired: { label: "Expired", classes: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
        transferred_out: {
            label: "Transferred",
            classes: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
        },
    };

    const config = configs[status] || { label: status, classes: "bg-gray-100 text-gray-600" };

    return (
        <span className="inline-flex items-center gap-2">
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.classes} ${config.pulse ? "animate-pulse" : ""}`}
            >
                {config.label}
            </span>
            {status === "pending_dns" && onCheckNow && (
                <button
                    type="button"
                    onClick={onCheckNow}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition"
                >
                    Check Now
                </button>
            )}
        </span>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
            {copied ? (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                    Copy
                </>
            )}
        </button>
    );
}

/* ──────────────────────────────────────────────
   Contact Form Modal
   ────────────────────────────────────────────── */

function ContactFormModal({
    domainName,
    businessSlug,
    onClose,
}: {
    domainName: string;
    businessSlug: string;
    onClose: () => void;
}) {
    const [contact, setContact] = useState({
        first_name: "",
        last_name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        email: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        router.post(
            route("alphasite.domains.purchase", { slug: businessSlug }),
            { domain_name: domainName, contact },
            {
                onError: (errs) => setErrors(errs as Record<string, string>),
                onFinish: () => setSubmitting(false),
                onSuccess: () => onClose(),
            },
        );
    };

    const inputClasses =
        "w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Register Domain</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Contact info for <strong>{domainName}</strong> (required by ICANN)
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="first_name" className={labelClasses}>First Name</label>
                            <input id="first_name" name="first_name" value={contact.first_name} onChange={handleChange} required className={inputClasses} />
                            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label htmlFor="last_name" className={labelClasses}>Last Name</label>
                            <input id="last_name" name="last_name" value={contact.last_name} onChange={handleChange} required className={inputClasses} />
                            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="address" className={labelClasses}>Address</label>
                        <input id="address" name="address" value={contact.address} onChange={handleChange} required className={inputClasses} />
                        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="city" className={labelClasses}>City</label>
                            <input id="city" name="city" value={contact.city} onChange={handleChange} required className={inputClasses} />
                            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                        </div>
                        <div>
                            <label htmlFor="state" className={labelClasses}>State</label>
                            <input id="state" name="state" value={contact.state} onChange={handleChange} required className={inputClasses} />
                            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                        </div>
                        <div>
                            <label htmlFor="zip" className={labelClasses}>ZIP</label>
                            <input id="zip" name="zip" value={contact.zip} onChange={handleChange} required className={inputClasses} />
                            {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phone" className={labelClasses}>Phone</label>
                        <input id="phone" name="phone" type="tel" value={contact.phone} onChange={handleChange} required className={inputClasses} />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClasses}>Email</label>
                        <input id="email" name="email" type="email" value={contact.email} onChange={handleChange} required className={inputClasses} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {submitting ? "Registering..." : "Register This Domain"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   AI Support Chat
   ────────────────────────────────────────────── */

function AiSupportChat({ businessSlug }: { businessSlug: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content:
                "Hi! I can help you with domain setup, DNS configuration, and troubleshooting. What do you need help with?",
        },
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const quickActions = [
        "How do I update DNS at GoDaddy?",
        "How long does DNS take?",
        "CNAME vs A record?",
        "My domain isn't working",
    ];

    const sendMessage = async (message: string) => {
        if (!message.trim() || sending) return;

        const userMessage: ChatMessage = { role: "user", content: message.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setSending(true);

        try {
            const response = await axios.post(
                route("alphasite.domains.support-chat", { slug: businessSlug }),
                { message: message.trim() },
            );
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.data.message || response.data.reply || "I'm sorry, I couldn't process that. Please try again.",
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again in a moment.",
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition"
                aria-label="Open AI support chat"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 w-full max-w-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[32rem]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">DNS Support</h4>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {sending && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                        {quickActions.map((action) => (
                            <button
                                key={action}
                                type="button"
                                onClick={() => sendMessage(action)}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full px-3 py-1.5 transition"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about DNS setup..."
                            disabled={sending}
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={sending || !input.trim()}
                            className="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function DomainsIndex({ business, domains: initialDomains, alphasiteSubdomain }: Props) {
    const [domains, setDomains] = useState<BusinessDomain[]>(initialDomains);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [externalDomain, setExternalDomain] = useState("");
    const [connectingExternal, setConnectingExternal] = useState(false);
    const [recheckingId, setRecheckingId] = useState<string | null>(null);
    const [purchaseModal, setPurchaseModal] = useState<string | null>(null);

    /* ── Domain Search ── */

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchError("");
        setSearchResults([]);

        try {
            const response = await axios.post(
                route("alphasite.domains.search", { slug: business.slug }),
                { query: searchQuery.trim() },
            );
            setSearchResults(response.data.results || []);
        } catch {
            setSearchError("Could not search domains. Please try again.");
        } finally {
            setSearching(false);
        }
    };

    /* ── Connect External Domain ── */

    const handleConnectExternal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!externalDomain.trim()) return;

        setConnectingExternal(true);
        router.post(
            route("alphasite.domains.connect", { slug: business.slug }),
            { domain_name: externalDomain.trim() },
            {
                onSuccess: () => setExternalDomain(""),
                onFinish: () => setConnectingExternal(false),
            },
        );
    };

    /* ── DNS Recheck ── */

    const handleRecheck = async (domain: BusinessDomain) => {
        setRecheckingId(domain.id);
        try {
            const response = await axios.post(
                route("alphasite.domains.recheck", { slug: business.slug, domain: domain.id }),
            );
            if (response.data.domain) {
                setDomains((prev) =>
                    prev.map((d) => (d.id === domain.id ? { ...d, ...response.data.domain } : d)),
                );
            }
        } catch {
            // Silently fail -- the user can try again
        } finally {
            setRecheckingId(null);
        }
    };

    /* ── Set Primary ── */

    const handleSetPrimary = (domain: BusinessDomain) => {
        router.post(route("alphasite.domains.primary", { slug: business.slug, domain: domain.id }));
    };

    /* ── Remove Domain ── */

    const handleRemove = (domain: BusinessDomain) => {
        if (!confirm(`Are you sure you want to remove ${domain.domain_name}? This cannot be undone.`)) return;
        router.delete(route("alphasite.domains.destroy", { slug: business.slug, domain: domain.id }));
    };

    /* ── Time Formatting ── */

    const formatRelativeTime = (dateString: string | null): string => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <Layout>
            <Head>
                <title>Domains - {business.name} - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ═══════════════════════════════════
                        PAGE HEADER
                        ═══════════════════════════════════ */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Domain</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage domains for <strong>{business.name}</strong>
                        </p>
                    </div>

                    {/* ═══════════════════════════════════
                        1. TRANSPARENCY BANNER
                        ═══════════════════════════════════ */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5 mb-6">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
                                    Domain Convenience Service
                                </h3>
                                <p className="text-sm text-blue-800 dark:text-blue-300/80 mt-1 leading-relaxed">
                                    We help you get and connect a domain as a free convenience. Domain purchases are
                                    through Cloudflare at their at-cost pricing -- we add zero markup and make zero
                                    profit on domains. Need help? Our AI assistant can walk you through DNS setup.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════
                        2. SUBDOMAIN NOTICE
                        ═══════════════════════════════════ */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    Your site is already live at:{" "}
                                    <a
                                        href={`https://${alphasiteSubdomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold underline hover:text-green-900 dark:hover:text-green-200 transition"
                                    >
                                        {alphasiteSubdomain}
                                    </a>
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                                    A custom domain is optional -- your site works great without one.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════
                        3. CURRENT DOMAINS LIST
                        ═══════════════════════════════════ */}
                    {domains.length > 0 && (
                        <div className="mb-8 space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Domains</h2>

                            {domains.map((domain) => (
                                <SectionCard key={domain.id}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Domain name + status */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                    {domain.domain_name}
                                                </h3>
                                                {domain.is_primary && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                <StatusBadge
                                                    status={domain.status}
                                                    onCheckNow={
                                                        domain.status === "pending_dns"
                                                            ? () => handleRecheck(domain)
                                                            : undefined
                                                    }
                                                />
                                                {recheckingId === domain.id && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                                                        Checking...
                                                    </span>
                                                )}
                                                {domain.last_dns_check_at && (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        Last checked {formatRelativeTime(domain.last_dns_check_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {!domain.is_primary && domain.status === "active" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetPrimary(domain)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                                                >
                                                    Set as Primary
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(domain)}
                                                className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* DNS Instructions (pending_dns or dns_error) */}
                                    {(domain.status === "pending_dns" || domain.status === "dns_error") &&
                                        domain.dns_instructions && (
                                            <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-5">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    DNS Setup Instructions
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    {domain.dns_instructions.summary}
                                                </p>

                                                {/* Steps */}
                                                <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    {domain.dns_instructions.steps.map((step, i) => (
                                                        <li key={i}>{step}</li>
                                                    ))}
                                                </ol>

                                                {/* DNS Record Values */}
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Record Type
                                                        </span>
                                                        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                                            {domain.dns_instructions.record_type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Name / Host
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                                                {domain.dns_instructions.record_name}
                                                            </code>
                                                            <CopyButton text={domain.dns_instructions.record_name} />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Value / Target
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded break-all">
                                                                {domain.dns_instructions.record_value}
                                                            </code>
                                                            <CopyButton text={domain.dns_instructions.record_value} />
                                                        </div>
                                                    </div>

                                                    {domain.dns_instructions.fallback_type && domain.dns_instructions.fallback_value && (
                                                        <>
                                                            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                    Fallback (if your provider doesn't support the above):
                                                                </p>
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                        {domain.dns_instructions.fallback_type} Record
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                                                            {domain.dns_instructions.fallback_value}
                                                                        </code>
                                                                        <CopyButton text={domain.dns_instructions.fallback_value} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </SectionCard>
                            ))}
                        </div>
                    )}

                    {/* ═══════════════════════════════════
                        4. GET A DOMAIN
                        ═══════════════════════════════════ */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Get a Domain</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* ── Path A: New Domain ── */}
                            <SectionCard>
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        I need a new domain
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Search for available domains. We register through Cloudflare at their cost.
                                </p>

                                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="mybusiness.com"
                                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={searching || !searchQuery.trim()}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition text-sm shrink-0"
                                    >
                                        {searching ? "Searching..." : "Search"}
                                    </button>
                                </form>

                                {searchError && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">{searchError}</p>
                                )}

                                {searchResults.length > 0 && (
                                    <div className="space-y-3">
                                        {searchResults.map((result) => (
                                            <div
                                                key={result.domain}
                                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {result.domain}
                                                    </div>
                                                    {result.available ? (
                                                        <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                                            Available
                                                            {result.price != null && (
                                                                <span className="text-gray-600 dark:text-gray-400 ml-1">
                                                                    --{" "}
                                                                    <strong>
                                                                        ${result.price.toFixed(2)}/{result.currency === "USD" ? "year" : result.currency}
                                                                    </strong>{" "}
                                                                    -- Cloudflare's at-cost price. We add zero markup.
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                                                            Not available
                                                        </div>
                                                    )}
                                                </div>
                                                {result.available && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPurchaseModal(result.domain)}
                                                        className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition shrink-0 ml-3"
                                                    >
                                                        Register This Domain
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            {/* ── Path B: External Domain ── */}
                            <SectionCard>
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        I already have a domain
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Connect a domain you own. We'll give you DNS instructions to point it here.
                                </p>

                                <form onSubmit={handleConnectExternal} className="space-y-3">
                                    <div>
                                        <label
                                            htmlFor="external_domain"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                        >
                                            Domain name
                                        </label>
                                        <input
                                            id="external_domain"
                                            type="text"
                                            value={externalDomain}
                                            onChange={(e) => setExternalDomain(e.target.value)}
                                            placeholder="mybusiness.com"
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={connectingExternal || !externalDomain.trim()}
                                        className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 transition text-sm"
                                    >
                                        {connectingExternal ? "Connecting..." : "Connect My Domain"}
                                    </button>
                                </form>
                            </SectionCard>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════
                5. AI SUPPORT CHAT
                ═══════════════════════════════════ */}
            <AiSupportChat businessSlug={business.slug} />

            {/* ═══════════════════════════════════
                PURCHASE MODAL
                ═══════════════════════════════════ */}
            {purchaseModal && (
                <ContactFormModal
                    domainName={purchaseModal}
                    businessSlug={business.slug}
                    onClose={() => setPurchaseModal(null)}
                />
            )}
        </Layout>
    );
}
