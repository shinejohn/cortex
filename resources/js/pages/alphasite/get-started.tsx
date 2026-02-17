import { Head, Link } from "@inertiajs/react";
import Layout from "@/layouts/layout";

export default function GetStarted() {
    return (
        <Layout>
            <Head>
                <title>Get Started - AlphaSite</title>
            </Head>
            <div className="min-h-screen bg-muted/50 p-8">
                <h1 className="text-2xl font-bold">Get Started</h1>
                <p className="text-muted-foreground mt-2">Claim your business and get your AI-powered page.</p>
            </div>
        </Layout>
    );
}
