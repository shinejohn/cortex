import { Head, Link } from "@inertiajs/react";
import Layout from "@/layouts/layout";

interface Props {
    businesses: { data: unknown[]; links: unknown; meta: unknown };
    city: string;
    state: string;
    filters: Record<string, unknown>;
}

export default function DirectoryLocation({ businesses, city, state, filters }: Props) {
    return (
        <Layout>
            <Head>
                <title>Businesses in {city}, {state} - AlphaSite</title>
            </Head>
            <div className="min-h-screen bg-muted/50 p-8">
                <h1 className="text-2xl font-bold">Businesses in {city}, {state}</h1>
                <p className="text-muted-foreground mt-2">{businesses.data.length} businesses</p>
            </div>
        </Layout>
    );
}
