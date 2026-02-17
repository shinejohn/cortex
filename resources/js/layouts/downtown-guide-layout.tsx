import { SEO } from "@/components/common/seo";
import { type Auth } from "@/types";
import { type ReactNode } from "react";
import DowntownGuideHeader from "@/components/downtown-guide/downtown-guide-header";
import DowntownGuideBottomNav from "@/components/downtown-guide/bottom-nav";
import DowntownGuideFooter from "@/components/downtown-guide/downtown-guide-footer";

interface DowntownGuideLayoutProps {
    children: ReactNode;
    auth?: Auth;
    seo: {
        title: string;
        description?: string;
        image?: string | null;
        url?: string;
        type?: "website" | "article";
        [key: string]: any;
    };
    containerClassName?: string;
}

export default function DowntownGuideLayout({
    children,
    auth,
    seo,
    containerClassName = "container py-6",
}: DowntownGuideLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO
                type={seo.type || "website"}
                site="downtown-guide"
                data={{
                    ...seo,
                    description: seo.description || "Discover the best of downtown.",
                    image: seo.image || undefined,
                    url: seo.url || "",
                }}
            />

            <DowntownGuideHeader />

            <main className={`flex-1 ${containerClassName}`}>
                {children}
            </main>

            <DowntownGuideFooter />
            <DowntownGuideBottomNav />
        </div>
    );
}
