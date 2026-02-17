import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import {
    DollarSign,
    Users,
    QrCode,
    BarChart3,
    Download,
    Plus,
    TrendingUp,
    Heart,
} from 'lucide-react';

interface TipStats {
    total_tips: number;
    total_received_cents: number;
    total_fans: number;
    average_tip_cents: number;
    tips_this_month: number;
    revenue_this_month: number;
}

interface RecentTip {
    id: string;
    amount_cents: number;
    fan_message: string | null;
    is_anonymous: boolean;
    created_at: string;
    fan: { name: string; email: string };
}

interface FanData {
    id: string;
    name: string;
    email: string;
    source: string;
    tip_count: number;
    total_tips_given_cents: number;
    created_at: string;
}

interface QrFlyerData {
    id: string;
    template: string;
    title: string;
    scan_count: number;
    is_active: boolean;
    created_at: string;
}

interface FunnelMetrics {
    total_fans: number;
    converted_fans: number;
    conversion_rate: number;
    tipping_fans: number;
    tipping_rate: number;
    fans_by_source: Record<string, number>;
}

interface PerformerData {
    id: string;
    name: string;
    landing_page_slug: string;
}

interface Props {
    performer: PerformerData;
    stats?: TipStats;
    recentTips?: RecentTip[];
    funnelMetrics?: FunnelMetrics;
    fans?: { data: FanData[]; meta?: Record<string, unknown> };
    qrFlyers?: QrFlyerData[];
    templates?: { id: string; name: string; description: string }[];
    activeTab?: string;
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    sub?: string;
}) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                    <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
            </div>
        </div>
    );
}

export default function TipJarDashboard({
    performer,
    stats,
    recentTips,
    funnelMetrics,
    fans,
    qrFlyers,
    activeTab: initialTab,
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab || 'overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'fans', label: 'Fans', icon: Users },
        { id: 'qr-flyers', label: 'QR Flyers', icon: QrCode },
    ];

    return (
        <AppLayout>
            <Head title="Tip Jar Dashboard" />
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Tip Jar Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage your tips, fans, and promotional materials
                        </p>
                    </div>
                    {performer?.landing_page_slug && (
                        <a
                            href={`/p/${performer.landing_page_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                        >
                            View Landing Page
                        </a>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-8 flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                activeTab === tab.id
                                    ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                icon={DollarSign}
                                label="Total Earned"
                                value={`$${((stats.total_received_cents || 0) / 100).toFixed(2)}`}
                            />
                            <StatCard
                                icon={Heart}
                                label="Total Tips"
                                value={String(stats.total_tips || 0)}
                            />
                            <StatCard
                                icon={Users}
                                label="Total Fans"
                                value={String(stats.total_fans || 0)}
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Avg Tip"
                                value={`$${((stats.average_tip_cents || 0) / 100).toFixed(2)}`}
                            />
                        </div>

                        {/* Recent Tips */}
                        {recentTips && recentTips.length > 0 && (
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                    Recent Tips
                                </h3>
                                <div className="space-y-3">
                                    {recentTips.map((tip) => (
                                        <div
                                            key={tip.id}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {tip.is_anonymous ? 'Anonymous' : tip.fan?.name}
                                                </p>
                                                {tip.fan_message && (
                                                    <p className="text-sm italic text-gray-500">
                                                        &ldquo;{tip.fan_message}&rdquo;
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400">
                                                    {new Date(tip.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="text-lg font-bold text-green-600">
                                                ${(tip.amount_cents / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Funnel Metrics */}
                        {funnelMetrics && (
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                    Conversion Funnel
                                </h3>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {funnelMetrics.total_fans}
                                        </p>
                                        <p className="text-sm text-gray-500">Total Fans</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {funnelMetrics.tipping_fans}
                                        </p>
                                        <p className="text-sm text-gray-500">Tipping Fans</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {funnelMetrics.tipping_rate}%
                                        </p>
                                        <p className="text-sm text-gray-500">Tipping Rate</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {funnelMetrics.conversion_rate}%
                                        </p>
                                        <p className="text-sm text-gray-500">Conversion Rate</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Fans Tab */}
                {activeTab === 'fans' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <a
                                href="/dashboard/tip-jar/fans/export"
                                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Download className="h-4 w-4" /> Export CSV
                            </a>
                        </div>
                        <div className="rounded-xl bg-white shadow-sm dark:bg-gray-900">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b dark:border-gray-800">
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Source
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Tips
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Total Given
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fans?.data || []).map((fan) => (
                                        <tr key={fan.id} className="border-b dark:border-gray-800">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {fan.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                {fan.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                    {fan.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                {fan.tip_count}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-green-600">
                                                ${(fan.total_tips_given_cents / 100).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!fans?.data || fans.data.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center text-gray-400"
                                            >
                                                No fans captured yet. Share your landing page to start
                                                building your audience!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* QR Flyers Tab */}
                {activeTab === 'qr-flyers' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {(qrFlyers || []).map((flyer) => (
                                <div
                                    key={flyer.id}
                                    className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
                                >
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        {flyer.title}
                                    </h4>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                        <span>{flyer.template}</span>
                                        <span>{flyer.scan_count} scans</span>
                                    </div>
                                    <div
                                        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                            flyer.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {flyer.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            ))}

                            {/* Add New Flyer */}
                            <button className="flex min-h-[150px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-purple-400 hover:text-purple-500 dark:border-gray-700">
                                <div className="text-center">
                                    <Plus className="mx-auto h-8 w-8" />
                                    <p className="mt-1 text-sm font-medium">Create New Flyer</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
