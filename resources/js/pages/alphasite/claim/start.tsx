import { Head, useForm } from "@inertiajs/react";
import Layout from "@/layouts/layout";

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        address?: string;
        city?: string;
        state?: string;
        phone?: string;
        email?: string;
    };
}

export default function ClaimStart({ business }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        verification_method: "phone", // or "email"
        verification_code: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/claim/${business.slug}/verify`);
    };

    return (
        <Layout>
            <Head>
                <title>Claim {business.name} - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow p-8">
                        <h1 className="text-3xl font-bold mb-4">Claim Your Business</h1>
                        <p className="text-gray-600 mb-6">
                            Verify ownership of <strong>{business.name}</strong> to claim and manage your business page.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Method</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="verification_method"
                                            value="phone"
                                            checked={data.verification_method === "phone"}
                                            onChange={(e) => setData("verification_method", e.target.value)}
                                            className="mr-2"
                                        />
                                        <span>Phone: {business.phone || "Not available"}</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="verification_method"
                                            value="email"
                                            checked={data.verification_method === "email"}
                                            onChange={(e) => setData("verification_method", e.target.value)}
                                            className="mr-2"
                                        />
                                        <span>Email: {business.email || "Not available"}</span>
                                    </label>
                                </div>
                                {errors.verification_method && <p className="mt-1 text-sm text-red-600">{errors.verification_method}</p>}
                            </div>

                            <div>
                                <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="verification_code"
                                    value={data.verification_code}
                                    onChange={(e) => setData("verification_code", e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter verification code"
                                />
                                {errors.verification_code && <p className="mt-1 text-sm text-red-600">{errors.verification_code}</p>}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? "Verifying..." : "Verify & Claim"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
