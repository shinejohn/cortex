import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    MessageSquare,
    Star,
    Clock,
    Tag,
    User,
} from "lucide-react";
import Layout from "@/layouts/layout";

interface Business {
    id: string;
    name: string;
    slug: string;
}

interface Interaction {
    id: string;
    type: string;
    summary: string;
    notes?: string;
    created_at: string;
}

interface Review {
    id: string;
    rating: number;
    comment?: string;
    created_at: string;
}

interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
    tags?: string[];
    total_interactions?: number;
    total_spent?: number;
    first_visit_at?: string;
    last_interaction_at?: string;
    created_at: string;
    interactions?: Interaction[];
    reviews?: Review[];
}

interface Props {
    business: Business;
    customer: Customer;
}

export default function CustomerShow({ business, customer }: Props) {
    return (
        <Layout>
            <Head>
                <title>{customer.name} - Customer - {business.name} CRM - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 lg:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/crm/customers"
                            className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Customers
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 text-white font-bold text-2xl backdrop-blur-sm">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">
                                    {customer.name}
                                </h1>
                                <p className="text-blue-100/90 mt-1">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Contact Info */}
                        <div className="space-y-6">
                            {/* Contact Card */}
                            <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Contact Information
                                </h3>
                                <div className="space-y-4">
                                    {customer.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Email</div>
                                                <a href={`mailto:${customer.email}`} className="text-sm font-medium text-primary hover:underline">
                                                    {customer.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {customer.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Phone</div>
                                                <a href={`tel:${customer.phone}`} className="text-sm font-medium text-foreground">
                                                    {customer.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {(customer.address || customer.city) && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Location</div>
                                                <div className="text-sm font-medium text-foreground">
                                                    {customer.address && <div>{customer.address}</div>}
                                                    {customer.city && (
                                                        <div>
                                                            {customer.city}
                                                            {customer.state && `, ${customer.state}`}
                                                            {customer.zip && ` ${customer.zip}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                <h3 className="font-semibold text-foreground mb-5">Customer Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-foreground">{customer.total_interactions ?? 0}</div>
                                        <div className="text-xs text-muted-foreground mt-1">Interactions</div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-foreground">
                                            {customer.total_spent ? `$${customer.total_spent.toFixed(2)}` : "$0"}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">Total Spent</div>
                                    </div>
                                </div>
                                {customer.last_interaction_at && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Last interaction: {new Date(customer.last_interaction_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {customer.tags && customer.tags.length > 0 && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {customer.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {customer.notes && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                    <h3 className="font-semibold text-foreground mb-4">Notes</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{customer.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Activity Timeline */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Interactions Timeline */}
                            <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Interaction History
                                </h3>
                                {customer.interactions && customer.interactions.length > 0 ? (
                                    <div className="relative">
                                        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                                        <div className="space-y-6">
                                            {customer.interactions.map((interaction) => (
                                                <div key={interaction.id} className="relative pl-12">
                                                    <div className="absolute left-[13px] top-1 h-5 w-5 rounded-full border-2 border-primary bg-card" />
                                                    <div className="bg-muted/30 rounded-xl p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                                                                {interaction.type}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(interaction.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-foreground">{interaction.summary}</p>
                                                        {interaction.notes && (
                                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                                {interaction.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No interactions recorded yet</p>
                                )}
                            </div>

                            {/* Reviews */}
                            {customer.reviews && customer.reviews.length > 0 && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                    <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                                        <Star className="h-5 w-5 text-primary" />
                                        Reviews
                                    </h3>
                                    <div className="space-y-4">
                                        {customer.reviews.map((review) => (
                                            <div key={review.id} className="bg-muted/30 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${
                                                                    i < review.rating
                                                                        ? "text-yellow-400 fill-yellow-400"
                                                                        : "text-muted-foreground/30"
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-foreground">{review.comment}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
