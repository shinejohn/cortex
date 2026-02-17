import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Users, DollarSign, BarChart3, Settings, TrendingUp, Briefcase } from 'lucide-react';

interface Props {
    agent?: any;
    active_clients?: any[];
    pending_clients?: any[];
    total_commissions?: number;
    pending_commissions?: number;
    recent_commissions?: any[];
    clients?: any;
    commissionReport?: any;
    recentCommissions?: any;
    activeTab?: string;
}

export default function AgentDashboard({ agent, active_clients, pending_clients, total_commissions, pending_commissions, recent_commissions, clients, commissionReport, recentCommissions, activeTab: initialTab }: Props) {
    const [activeTab, setActiveTab] = useState(initialTab || 'overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'commissions', label: 'Commissions', icon: DollarSign },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <AppLayout>
            <Head title="Agent Dashboard" />
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        <Briefcase className="mr-2 inline h-8 w-8" /> Agent Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{agent?.agency_name}</p>
                </div>

                <div className="mb-8 flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'}`}>
                            <tab.icon className="h-4 w-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <p className="text-sm text-gray-500">Active Clients</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{active_clients?.length || 0}</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <p className="text-sm text-gray-500">Total Earned</p>
                                <p className="text-2xl font-bold text-green-600">${((total_commissions || 0) / 100).toFixed(2)}</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <p className="text-sm text-gray-500">Pending Payouts</p>
                                <p className="text-2xl font-bold text-orange-600">${((pending_commissions || 0) / 100).toFixed(2)}</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <p className="text-sm text-gray-500">Subscription</p>
                                <p className="text-2xl font-bold text-purple-600 capitalize">{agent?.subscription_tier || 'Free'}</p>
                            </div>
                        </div>

                        {active_clients && active_clients.length > 0 && (
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Active Clients</h3>
                                <div className="space-y-3">
                                    {active_clients.map((client: any) => (
                                        <div key={client.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                            <div className="flex items-center gap-3">
                                                <img src={client.user?.avatar} alt="" className="h-10 w-10 rounded-full" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{client.user?.name}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{client.client_type}</p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Active</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'clients' && (
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Manage Clients</h3>
                        {(!clients?.data || clients.data.length === 0) && (
                            <p className="py-8 text-center text-gray-400">No clients yet. Start inviting performers and venue owners to grow your roster.</p>
                        )}
                    </div>
                )}

                {activeTab === 'commissions' && commissionReport && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <p className="text-sm text-gray-500">Total Earned</p>
                                <p className="text-2xl font-bold text-green-600">${((commissionReport.total_earned || 0) / 100).toFixed(2)}</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-orange-600">${((commissionReport.total_pending || 0) / 100).toFixed(2)}</p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                                <p className="text-sm text-gray-500">Paid Out</p>
                                <p className="text-2xl font-bold text-blue-600">${((commissionReport.total_paid || 0) / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Agent Settings</h3>
                        <p className="text-gray-500">Settings management coming soon.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
