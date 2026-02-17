import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";

interface Customer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    source: string;
    status: string;
    health_score: number | null;
    ai_notes: string | null;
    tags: string[] | null;
}

interface Interaction {
    id: string;
    interaction_type: string;
    channel: string;
    direction: string;
    subject: string | null;
    content: string | null;
    handled_by: string;
    ai_service_used: string | null;
    outcome: string;
    sentiment: string | null;
    created_at: string;
}

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        alphasite_subdomain: string | null;
        subscription_tier: string;
        city: string | null;
        state: string | null;
    };
    subscription: {
        tier: string;
        status: string;
        trial_expires_at: string | null;
        ai_services_enabled: string[];
    } | null;
    customer: {
        customer: Customer;
        interactions: Interaction[];
        survey_responses: unknown[];
    };
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        lead: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        prospect: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        customer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        inactive: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        churned: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
        <span
            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                colors[status] ?? "bg-gray-100 text-gray-700"
            }`}
        >
            {status}
        </span>
    );
}

export default function CrmCustomerShow({
    business,
    subscription,
    customer,
}: Props) {
    const c = customer.customer;
    const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown";

    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title={`Customer: ${name}`}
        >
            <Head title={`${name} | Customers | ${business.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={route("alphasite.crm.customers")}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                    >
                        ← Back to customers
                    </Link>
                </div>

                {/* Customer Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {c.email ?? "No email"}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {c.phone ?? "No phone"}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <StatusBadge status={c.status} />
                                {c.health_score !== null && (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Health: {c.health_score}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Notes */}
                {c.ai_notes && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            AI Notes
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                            {c.ai_notes}
                        </p>
                    </div>
                )}

                {/* Interaction Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Interactions
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {customer.interactions.length === 0 ? (
                            <p className="px-6 py-8 text-gray-500 dark:text-gray-400 text-sm">
                                No interactions yet.
                            </p>
                        ) : (
                            customer.interactions.map((i) => (
                                <div
                                    key={i.id}
                                    className="px-6 py-4 flex gap-4"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
                                        •
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {i.interaction_type} · {i.channel} ·{" "}
                                            {i.handled_by}
                                        </p>
                                        {i.subject && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                {i.subject}
                                            </p>
                                        )}
                                        {i.content && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {i.content}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {new Date(
                                                i.created_at
                                            ).toLocaleString()} · {i.outcome}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Survey Responses */}
                {customer.survey_responses.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Survey Responses
                        </h2>
                        <div className="space-y-4">
                            {customer.survey_responses.map((sr: unknown, i: number) => (
                                <div
                                    key={i}
                                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                >
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                                        {JSON.stringify(sr, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AlphasiteCrmLayout>
    );
}
