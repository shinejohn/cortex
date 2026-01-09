import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { CheckCircle, Eye } from "lucide-react";

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
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="rounded-lg border bg-card p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-green-100 p-4">
                                <CheckCircle className="size-12 text-green-600" />
                            </div>
                        </div>

                        <h1 className="mb-4 text-3xl font-bold">Listing Confirmed!</h1>
                        <p className="mb-6 text-lg text-muted-foreground">
                            Your classified listing "{classified.title}" is now active and visible to the community.
                        </p>

                        {classified.payment && (
                            <div className="mb-6 rounded-lg bg-muted p-4 text-left">
                                <h3 className="mb-2 font-semibold">Payment Details</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span>{classified.payment.total_days} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Regions:</span>
                                        <span>{classified.regions.length}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Amount Paid:</span>
                                        <span>${(classified.payment.amount / 100).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <Badge variant="outline" className="mb-2">
                                Active Regions
                            </Badge>
                            <div className="flex flex-wrap justify-center gap-2">
                                {classified.regions.map((region) => (
                                    <Badge key={region.id} variant="secondary">
                                        {region.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={() => router.visit("/classifieds")}>
                                Browse Listings
                            </Button>
                            <Button onClick={() => router.visit(`/classifieds/${classified.id}`)}>
                                <Eye className="mr-2 size-4" />
                                View My Listing
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
