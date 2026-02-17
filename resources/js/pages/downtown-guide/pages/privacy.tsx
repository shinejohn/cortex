import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head } from "@inertiajs/react";
import { Auth } from "@/types";

interface Props {
    auth: Auth;
}

export default function Privacy({ auth }: Props) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Privacy Policy",
                description: "Our commitment to your privacy",
            }}
        >
            <Head title="Privacy Policy" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                        <div className="prose max-w-none text-gray-600">
                            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                            <p className="mb-4">
                                At Downtown Guide, we take your privacy seriously. This Privacy Policy describes how we collect,
                                use, and disclose your personal information when you use our website and services.
                            </p>
                            {/* Placeholder for actual privacy policy content */}
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
                            <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>

                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
                            <p>We use your information to provide, maintain, and improve our services, including personalization and rewards tracking.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
