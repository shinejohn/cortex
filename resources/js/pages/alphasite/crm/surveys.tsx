import { Head, Link } from "@inertiajs/react";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, BarChart3 } from "lucide-react";

interface BusinessSurvey {
    id: string;
    name: string;
    questions: unknown;
    trigger_type: string;
    is_active: boolean;
    responses_count: number;
    created_at: string;
}

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        alphasite_subdomain: string | null;
        subscription_tier: string;
        city: string | null;
        state: string | null;
    };
    subscription: {
        tier: string;
        status: string;
        trial_expires_at: string | null;
        ai_services_enabled: string[];
    } | null;
    surveys: BusinessSurvey[];
}

export default function CrmSurveys({
    business,
    subscription,
    surveys,
}: Props) {
    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title="Surveys"
        >
            <Head title={`Surveys | ${business.name}`} />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                            Surveys
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Collect feedback and insights.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {surveys.length === 0 ? (
                        <div className="col-span-full border-2 border-dashed border-muted rounded-xl p-12 text-center bg-muted/10">
                            <div className="flex justify-center mb-4">
                                <div className="bg-background rounded-full p-4 shadow-sm">
                                    <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                Create surveys to gather valuable insights from your customers automatically.
                            </p>
                            <Button variant="outline" disabled>
                                <Plus className="mr-2 h-4 w-4" /> Create Survey (Coming Soon)
                            </Button>
                        </div>
                    ) : (
                        surveys.map((survey) => (
                            <Card key={survey.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{survey.name}</CardTitle>
                                        <CardDescription className="capitalize">
                                            Trigger: {survey.trigger_type.replace('_', ' ')}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={survey.is_active ? "default" : "secondary"}>
                                        {survey.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>{survey.responses_count} responses</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                        <Button variant="ghost" size="sm" className="ml-auto" disabled>
                                            View Results
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AlphasiteCrmLayout>
    );
}
