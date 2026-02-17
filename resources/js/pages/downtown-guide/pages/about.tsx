import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head } from "@inertiajs/react";
import { Auth } from "@/types";

interface Props {
    auth: Auth;
}

export default function About({ auth }: Props) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "About Us",
                description: "Learn more about the Downtown Guide",
            }}
        >
            <Head title="About Us" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Downtown Guide</h1>
                        <div className="prose max-w-none text-gray-600">
                            <p className="mb-4">
                                Welcome to the Downtown Guide, your ultimate companion for exploring the heart of our city.
                                We are dedicated to connecting you with the best local businesses, events, and community stories.
                            </p>
                            <p className="mb-4">
                                Our mission is to support local commerce and foster a vibrant downtown community.
                                Whether you're a long-time resident or a first-time visitor, Downtown Guide helps you
                                discover hidden gems, earn rewards for shopping local, and stay connected with what's happening.
                            </p>
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Our Values</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Community First:</strong> We believe in the power of local connections.</li>
                                <li><strong>Support Local:</strong> We champion independent businesses and artisans.</li>
                                <li><strong>Innovation:</strong> We use technology to enhance your downtown experience.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
