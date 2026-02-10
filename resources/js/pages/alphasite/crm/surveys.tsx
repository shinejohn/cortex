import { Head, Link } from "@inertiajs/react";
import {
    ClipboardList,
    ChevronRight,
    BarChart3,
    Users,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    Plus,
} from "lucide-react";
import Layout from "@/layouts/layout";

interface Business {
    id: string;
    name: string;
    slug: string;
}

interface Survey {
    id: string;
    title: string;
    description?: string;
    status: "draft" | "active" | "closed";
    total_responses?: number;
    total_questions?: number;
    starts_at?: string;
    ends_at?: string;
    created_at: string;
}

interface Props {
    business: Business;
    surveys: Survey[] | { data: Survey[] };
}

function getStatusBadge(status: string) {
    switch (status) {
        case "active":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                </span>
            );
        case "closed":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Closed
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                    <Clock className="h-3 w-3" />
                    Draft
                </span>
            );
    }
}

export default function CrmSurveys({ business, surveys: surveysProp }: Props) {
    const surveyList = Array.isArray(surveysProp) ? surveysProp : surveysProp?.data ?? [];

    const activeSurveys = surveyList.filter((s) => s.status === "active");
    const closedSurveys = surveyList.filter((s) => s.status === "closed");
    const draftSurveys = surveyList.filter((s) => s.status === "draft");

    return (
        <Layout>
            <Head>
                <title>Surveys - {business.name} CRM - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 lg:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
                            <Link href="/crm" className="hover:text-white transition-colors">
                                CRM
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span>Surveys</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">Surveys</h1>
                                <p className="text-blue-100/90 mt-2">
                                    Collect feedback from your customers ({surveyList.length} total)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-card rounded-2xl border-none shadow-sm p-5 flex items-center gap-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950">
                                <BarChart3 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">{activeSurveys.length}</div>
                                <div className="text-sm text-muted-foreground">Active Surveys</div>
                            </div>
                        </div>
                        <div className="bg-card rounded-2xl border-none shadow-sm p-5 flex items-center gap-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">
                                    {surveyList.reduce((sum, s) => sum + (s.total_responses ?? 0), 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Responses</div>
                            </div>
                        </div>
                        <div className="bg-card rounded-2xl border-none shadow-sm p-5 flex items-center gap-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted">
                                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">{closedSurveys.length}</div>
                                <div className="text-sm text-muted-foreground">Completed</div>
                            </div>
                        </div>
                    </div>

                    {/* Surveys List */}
                    {surveyList.length > 0 ? (
                        <div className="space-y-8">
                            {/* Active Surveys */}
                            {activeSurveys.length > 0 && (
                                <div>
                                    <h2 className="font-display text-lg font-bold tracking-tight text-foreground mb-4">Active Surveys</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeSurveys.map((survey) => (
                                            <SurveyCard key={survey.id} survey={survey} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Draft Surveys */}
                            {draftSurveys.length > 0 && (
                                <div>
                                    <h2 className="font-display text-lg font-bold tracking-tight text-foreground mb-4">Drafts</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {draftSurveys.map((survey) => (
                                            <SurveyCard key={survey.id} survey={survey} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Closed Surveys */}
                            {closedSurveys.length > 0 && (
                                <div>
                                    <h2 className="font-display text-lg font-bold tracking-tight text-foreground mb-4">Completed</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {closedSurveys.map((survey) => (
                                            <SurveyCard key={survey.id} survey={survey} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                <ClipboardList className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Surveys Yet</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Create surveys to collect valuable feedback from your customers and improve your services.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function SurveyCard({ survey }: { survey: Survey }) {
    return (
        <div className="bg-card rounded-2xl border-none shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 shrink-0">
                        <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{survey.title}</h3>
                        {survey.total_questions !== undefined && (
                            <p className="text-xs text-muted-foreground">{survey.total_questions} questions</p>
                        )}
                    </div>
                </div>
                {getStatusBadge(survey.status)}
            </div>
            {survey.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{survey.description}</p>
            )}
            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {survey.total_responses ?? 0} responses
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(survey.created_at).toLocaleDateString()}
                    </span>
                </div>
                {survey.status !== "draft" && (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Eye className="h-3.5 w-3.5" />
                        View Results
                    </span>
                )}
            </div>
        </div>
    );
}
