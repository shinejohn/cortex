import { Head, Link } from "@inertiajs/react";
import { Layers, ArrowRight, Building2 } from "lucide-react";
import Layout from "@/layouts/layout";

interface Industry {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    display_order?: number;
    is_active: boolean;
    parent_id?: string;
    children?: Industry[];
}

interface Props {
    industries: Industry[];
}

export default function IndustriesIndex({ industries }: Props) {
    const parentIndustries = industries.filter((i) => !i.parent_id);
    const childIndustries = industries.filter((i) => i.parent_id);

    const getChildren = (parentId: string) => childIndustries.filter((c) => c.parent_id === parentId);

    return (
        <Layout>
            <Head>
                <title>Industries - AlphaSite</title>
                <meta name="description" content="Browse businesses by industry category" />
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 lg:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
                            <Layers className="h-4 w-4" />
                            {industries.length} Industries
                        </div>
                        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight mb-4">Browse by Industry</h1>
                        <p className="text-xl text-blue-100/90 max-w-2xl mx-auto">
                            Find local businesses organized by industry. Select a category to explore businesses in your area.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {parentIndustries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {parentIndustries.map((industry) => {
                                const children = getChildren(industry.id);
                                return (
                                    <div
                                        key={industry.id}
                                        className="bg-card rounded-2xl border-none shadow-sm overflow-hidden hover:shadow-md transition-all"
                                    >
                                        <Link href={`/industry/${industry.slug}`} className="block p-6 group">
                                            <div className="flex items-start gap-4">
                                                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-2xl shrink-0">
                                                    {industry.icon || <Building2 className="h-7 w-7 text-primary" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                                        {industry.name}
                                                    </h2>
                                                    {industry.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                            {industry.description}
                                                        </p>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                                                        View businesses
                                                        <ArrowRight className="h-4 w-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Sub-industries */}
                                        {children.length > 0 && (
                                            <div className="border-t px-6 py-4 bg-muted/30">
                                                <div className="flex flex-wrap gap-2">
                                                    {children.slice(0, 5).map((child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/industry/${child.slug}`}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-card text-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors border"
                                                        >
                                                            {child.icon && <span className="mr-1">{child.icon}</span>}
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                    {children.length > 5 && (
                                                        <Link
                                                            href={`/industry/${industry.slug}`}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary rounded-full hover:bg-primary/10 transition-colors"
                                                        >
                                                            +{children.length - 5} more
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : industries.length > 0 ? (
                        /* Flat list when no parent/child hierarchy */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {industries.map((industry) => (
                                <Link
                                    key={industry.id}
                                    href={`/industry/${industry.slug}`}
                                    className="group flex items-center gap-3 bg-card rounded-2xl border-none shadow-sm p-5 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-xl shrink-0">
                                        {industry.icon || <Building2 className="h-6 w-6 text-primary" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {industry.name}
                                        </h3>
                                        {industry.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">{industry.description}</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                <Layers className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Industries Available</h3>
                            <p className="text-muted-foreground">Industries will be listed here once they are configured.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
