import { Head } from "@inertiajs/react";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    PenTool,
    Share2,
    ExternalLink
} from "lucide-react";

interface Props {
    business: any;
    subscription: any;
}

export default function CommunityNetwork({ business, subscription }: Props) {
    return (
        <AlphasiteCrmLayout business={business} subscription={subscription} title="Community Network">
            <Head title={`Community | ${business.name}`} />

            <div className="mb-8">
                <h1 className="text-3xl font-display font-black tracking-tight text-foreground">Local Ecosystem</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Connect with other businesses in {business.city}, {business.state}.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="size-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-blue-900 dark:text-blue-100">Downtown Guide Status</CardTitle>
                        </div>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            You are currently listed in the {business.city} Downtown Guide.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                            View Public Listing <ExternalLink className="ml-2 size-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50/50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <PenTool className="size-5 text-purple-600 dark:text-purple-400" />
                            <CardTitle className="text-purple-900 dark:text-purple-100">Local Voices</CardTitle>
                        </div>
                        <CardDescription className="text-purple-700 dark:text-purple-300">
                            Share your expert knowledge with the community to gain visibility.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                            Write an Article <Share2 className="ml-2 size-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nearby Businesses in Your Network</CardTitle>
                    <CardDescription>Collaborate with these businesses for cross-promotions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-lg bg-muted/20">
                        <Share2 className="size-10 text-muted-foreground/30 mb-3" />
                        <p className="text-center italic text-muted-foreground">Network graph visualization coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </AlphasiteCrmLayout>
    );
}
