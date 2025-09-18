import { AppContent } from "@/components/app-content";
import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import Header from "@/components/common/header";
import { Toaster } from "@/components/ui/sonner";
import { Auth, type BreadcrumbItem } from "@/types";
import type { PropsWithChildren } from "react";

export default function AppHeaderLayout({ children, breadcrumbs, auth }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; auth: Auth }>) {
    return (
        <AppShell>
            <Header auth={auth} breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
            <Toaster />
        </AppShell>
    );
}
