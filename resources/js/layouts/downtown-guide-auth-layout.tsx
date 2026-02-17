import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Auth } from "@/types";
import ApplicationLogo from "@/components/app-logo";
import { Link } from "@inertiajs/react";

interface DowntownGuideAuthLayoutProps {
    children: ReactNode;
    auth: Auth;
    title: string;
    description: string;
}

export default function DowntownGuideAuthLayout({ children, auth, title, description }: DowntownGuideAuthLayoutProps) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{ title: title }}
        >
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
                <Link href="/" className="mb-8 flex items-center space-x-2">
                    <ApplicationLogo className="h-10 w-10" />
                    <span className="text-xl font-bold">Downtown Guide</span>
                </Link>

                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {children}
                    </CardContent>
                </Card>
            </div>
        </DowntownGuideLayout>
    );
}
