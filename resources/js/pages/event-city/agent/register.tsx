import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Briefcase, Check, Star } from 'lucide-react';

interface Tier {
    name: string;
    max_clients: number;
    price_cents: number;
    commission_rate: number;
}

interface Props {
    tiers?: Record<string, Tier>;
    existingAgent?: any;
}

export default function AgentRegister({ tiers, existingAgent }: Props) {
    const [form, setForm] = useState({ agency_name: '', bio: '', specialties: [] as string[], service_areas: [] as string[] });
    const [processing, setProcessing] = useState(false);

    if (existingAgent) {
        return (
            <AppLayout>
                <Head title="Agent Registration" />
                <div className="mx-auto max-w-2xl px-6 py-16 text-center">
                    <Check className="mx-auto mb-4 h-16 w-16 text-green-500" />
                    <h1 className="text-2xl font-bold">You're already registered as an agent!</h1>
                    <a href="/agent/dashboard" className="mt-6 inline-block rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700">Go to Dashboard</a>
                </div>
            </AppLayout>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/agent/register', form, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Become a Booking Agent" />
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="mb-12 text-center">
                    <Briefcase className="mx-auto mb-4 h-12 w-12 text-purple-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Become a Booking Agent</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Manage performers and venues, earn commissions on bookings</p>
                </div>

                {/* Pricing Tiers */}
                {tiers && (
                    <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {Object.entries(tiers).map(([key, tier]) => (
                            <div key={key} className={`rounded-xl border-2 p-6 ${key === 'pro' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {tier.price_cents === 0 ? 'Free' : `$${(tier.price_cents / 100).toFixed(0)}`}
                                    {tier.price_cents > 0 && <span className="text-base font-normal text-gray-500">/mo</span>}
                                </p>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Up to {tier.max_clients} clients</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> {(tier.commission_rate * 100).toFixed(0)}% commission rate</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Marketplace listing</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">
                    <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Agent Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Agency Name *</label>
                            <input type="text" value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                        </div>
                        <button type="submit" disabled={processing} className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition">
                            {processing ? 'Registering...' : 'Register as Booking Agent (Free)'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
