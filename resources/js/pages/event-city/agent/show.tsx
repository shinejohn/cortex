import { Head } from '@inertiajs/react';
import Layout from '@/layouts/layout';
import { Star, Users, MapPin, Music, Calendar } from 'lucide-react';

interface Props {
    agent: { id: string; agency_name: string; slug: string; bio: string; specialties: string[]; service_areas: string[]; average_rating: number; total_bookings: number; user: { name: string; avatar: string } };
    activeClients: number;
}

export default function AgentShow({ agent, activeClients }: Props) {
    return (
        <Layout title={agent.agency_name}>
            <Head title={agent.agency_name} />
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">
                    <div className="flex items-start gap-6">
                        <img src={agent.user?.avatar} alt={agent.agency_name} className="h-20 w-20 rounded-full" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.agency_name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">by {agent.user?.name}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {agent.average_rating}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {agent.total_bookings} bookings</span>
                                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {activeClients} active clients</span>
                            </div>
                        </div>
                    </div>
                    {agent.bio && <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">{agent.bio}</p>}
                    {agent.specialties?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Specialties</h3>
                            <div className="flex flex-wrap gap-2">
                                {agent.specialties.map((s) => (
                                    <span key={s} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {agent.service_areas?.length > 0 && (
                        <div className="mt-4">
                            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Service Areas</h3>
                            <div className="flex flex-wrap gap-2">
                                {agent.service_areas.map((area) => (
                                    <span key={area} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400"><MapPin className="h-3 w-3" /> {area}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
