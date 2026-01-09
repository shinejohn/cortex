import { ReactNode } from "react";
import GoLocalVoicesHeader from "@/components/local-voices/go-local-voices-header";
import GoLocalVoicesFooter from "@/components/local-voices/go-local-voices-footer";
import type { Auth } from "@/types";

interface GoLocalVoicesLayoutProps {
    children: ReactNode;
    auth?: Auth;
}

export default function GoLocalVoicesLayout({ children, auth }: GoLocalVoicesLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <GoLocalVoicesHeader auth={auth} />
            <main className="flex-1">{children}</main>
            <GoLocalVoicesFooter />
        </div>
    );
}
