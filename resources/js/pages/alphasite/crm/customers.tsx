import { Head, Link, router } from "@inertiajs/react";
import { Users, Search, Mail, Phone, MapPin, Calendar, ChevronRight } from "lucide-react";
import Layout from "@/layouts/layout";
import { useState } from "react";

interface Business {
    id: string;
    name: string;
    slug: string;
}

interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    total_interactions?: number;
    last_interaction_at?: string;
    created_at: string;
    tags?: string[];
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    business: Business;
    customers: {
        data: Customer[];
        links: PaginationLinks[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
        };
    };
}

export default function CrmCustomers({ business, customers }: Props) {
    const [search, setSearch] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get("/crm/customers", { search }, { preserveState: true, preserveScroll: true });
    };

    return (
        <Layout>
            <Head>
                <title>Customers - {business.name} CRM - AlphaSite</title>
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
                            <span>Customers</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">Customers</h1>
                                <p className="text-blue-100/90 mt-2">
                                    {customers.meta?.total ?? customers.data.length} total customers for {business.name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                        </div>
                    </form>

                    {/* Customers Table (Desktop) */}
                    <div className="hidden lg:block bg-card rounded-2xl border-none shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                                        Customer
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                                        Contact
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                                        Location
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                                        Interactions
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/crm/customers/${customer.id}`}
                                                className="flex items-center gap-3 group"
                                            >
                                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                        {customer.name}
                                                    </div>
                                                    {customer.tags && customer.tags.length > 0 && (
                                                        <div className="flex gap-1.5 mt-1">
                                                            {customer.tags.slice(0, 3).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {customer.email && (
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.city && (
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {customer.city}
                                                    {customer.state && `, ${customer.state}`}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-foreground">
                                                {customer.total_interactions ?? 0}
                                            </div>
                                            {customer.last_interaction_at && (
                                                <div className="text-xs text-muted-foreground">
                                                    Last: {new Date(customer.last_interaction_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Customers Cards (Mobile) */}
                    <div className="lg:hidden space-y-4">
                        {customers.data.map((customer) => (
                            <Link
                                key={customer.id}
                                href={`/crm/customers/${customer.id}`}
                                className="block bg-card rounded-2xl border-none shadow-sm p-5 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-semibold">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-foreground">{customer.name}</div>
                                        {customer.email && (
                                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {customer.city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {customer.city}{customer.state && `, ${customer.state}`}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {customers.data.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Customers Found</h3>
                            <p className="text-muted-foreground">
                                Your customer list will grow as people interact with your business.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {customers.links && customers.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex gap-1.5">
                                {customers.links.map((link, index) => (
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
                </div>
            </div>
        </Layout>
    );
}
