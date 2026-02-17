import { Head, router } from '@inertiajs/react';
import Layout from '@/layouts/layout';
import { Search, Star, Users, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Agent {
    id: string;
    agency_name: string;
    slug: string;
    bio: string;
    specialties: string[];
    service_areas: string[];
    average_rating: number;
    total_bookings: number;
    user: { name: string; avatar: string };
}

interface Props {
    agents: { data: Agent[]; meta?: any };
    query?: string;
    specialty?: string;
}

export default function AgentMarketplace({ agents, query, specialty }: Props) {
    const [search, setSearch] = useState(query || '');

    return (
        <Layout title="Booking Agents">
            <Head title="Find a Booking Agent" />
            <div className="mx-auto max-w-6xl px-6 py-12">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Find a Booking Agent</h1>
                <p className="mb-8 text-gray-600 dark:text-gray-400">Professional agents to help manage your bookings and career</p>

                <div className="mb-8 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && router.visit(`/agents?q=${search}`)} placeholder="Search agents..." className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {agents.data.map((agent) => (
                        <a key={agent.id} href={`/agents/${agent.slug}`} className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-900">
                            <div className="flex items-start gap-4">
                                <img src={agent.user?.avatar} alt={agent.agency_name} className="h-12 w-12 rounded-full" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{agent.agency_name}</h3>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span>{agent.average_rating}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{agent.total_bookings} bookings</span>
                                    </div>
                                </div>
                            </div>
                            {agent.bio && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{agent.bio}</p>}
                            {agent.specialties?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {agent.specialties.slice(0, 3).map((s) => (
                                        <span key={s} className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{s}</span>
                                    ))}
                                </div>
                            )}
                        </a>
                    ))}
                </div>

                {agents.data.length === 0 && (
                    <div className="py-16 text-center text-gray-400">No agents found. Try adjusting your search.</div>
                )}
            </div>
        </Layout>
    );
}
