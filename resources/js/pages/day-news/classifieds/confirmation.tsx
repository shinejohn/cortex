import { Head, router, usePage } from "@inertiajs/react";
import { ArrowRight, Calendar, CheckCircle, Clock, Download, ExternalLink, Eye, Mail, Printer, Users } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface ConfirmationProps {
    auth?: Auth;
    classified: {
        id: string;
        title: string;
        regions: Array<{
            id: string;
            name: string;
        }>;
        payment: {
            amount: number;
            total_days: number;
        } | null;
    };
}

export default function Confirmation() {
    const { auth, classified } = usePage<ConfirmationProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title="Listing Confirmed - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Listing Confirmed - Day News",
                        url: `/classifieds/${classified.id}/confirmation`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm p-6">
                        {/* Success header */}
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex items-center justify-center size-16 rounded-full bg-green-100">
                                <CheckCircle className="size-8 text-green-600" />
                            </div>
                            <h1 className="mb-2 font-display text-2xl font-black tracking-tight text-gray-900">
                                Payment Successful!
                            </h1>
                            <p className="text-gray-600">
                                Your classified ad "{classified.title}" has been successfully published.
                            </p>
                        </div>

                        {/* Order details */}
                        {classified.payment && (
                            <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                                    <span className="text-sm text-gray-500">
                                        Ref #{classified.id}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <h3 className="mb-1 text-sm font-medium text-gray-500">Communities</h3>
                                            <div className="flex items-center">
                                                <Users className="mr-1 size-4 text-gray-400" />
                                                <p className="text-gray-900">{classified.regions.length} selected</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-sm font-medium text-gray-500">Duration</h3>
                                            <div className="flex items-center">
                                                <Clock className="mr-1 size-4 text-gray-400" />
                                                <p className="text-gray-900">{classified.payment.total_days} days</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-sm font-medium text-gray-500">Total Paid</h3>
                                            <p className="font-medium text-indigo-600">
                                                ${(classified.payment.amount / 100).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-sm font-medium text-gray-500">Selected Communities</h3>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {classified.regions.map((region) => (
                                                <span
                                                    key={region.id}
                                                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                                                >
                                                    {region.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Receipt actions */}
                        <div className="mb-8 flex flex-wrap gap-3">
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="mr-2 size-4" />
                                Print Receipt
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 size-4" />
                                Download PDF
                            </Button>
                            <Button variant="outline" size="sm">
                                <Mail className="mr-2 size-4" />
                                Email Receipt
                            </Button>
                        </div>

                        {/* What's next */}
                        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h3 className="mb-2 font-medium text-blue-800">What's Next?</h3>
                            <ul className="space-y-2 text-sm text-blue-700">
                                <li className="flex items-start">
                                    <span className="mr-2 text-blue-500">&bull;</span>
                                    <span>Your ad is now live in the selected communities</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2 text-blue-500">&bull;</span>
                                    <span>You can view and manage your ad from your profile page</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2 text-blue-500">&bull;</span>
                                    <span>You'll receive email notifications when users contact you about your ad</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => router.visit(`/classifieds/${classified.id}`)}
                            >
                                View Your Ad
                                <ExternalLink className="ml-2 size-4" />
                            </Button>
                            <Button variant="outline" onClick={() => router.visit("/classifieds")}>
                                Browse Listings
                            </Button>
                            <Button variant="outline" onClick={() => router.visit("/classifieds")}>
                                Go to Profile
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
