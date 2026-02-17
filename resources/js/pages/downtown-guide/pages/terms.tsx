import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head } from "@inertiajs/react";
import { Auth } from "@/types";

interface Props {
    auth: Auth;
}

export default function Terms({ auth }: Props) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Terms of Service",
                description: "Terms and conditions of use",
            }}
        >
            <Head title="Terms of Service" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                        <div className="prose max-w-none text-gray-600">
                            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                            <p className="mb-4">
                                Please read these Terms of Service carefully before using the Downtown Guide service.
                            </p>
                            {/* Placeholder for actual terms content */}
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
                            <p>By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>

                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">User Accounts</h2>
                            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
