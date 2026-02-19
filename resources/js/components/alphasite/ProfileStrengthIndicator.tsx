import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Database,
    Globe,
    FileText,
    MessageSquare,
    Sparkles,
    BarChart3
} from "lucide-react";

interface SourceCompleteness {
    source: string;
    label: string;
    pct: number;
    icon: React.ComponentType<{ className?: string }>;
}

interface ProfileStrengthIndicatorProps {
    profileCompleteness: number;
    dataSources?: string[];
    /** Per-source completeness: Google, Website, Survey, Customer Survey, AI Context */
    sourceCompleteness?: Partial<Record<string, number>>;
}

const SOURCE_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    google_places: { label: "Google", icon: Database },
    website_scan: { label: "Website", icon: Globe },
    serp_api: { label: "SERP", icon: Globe },
    owner_survey: { label: "Owner Survey", icon: FileText },
    customer_survey: { label: "Customer Survey", icon: MessageSquare },
    ai_context: { label: "AI Context", icon: Sparkles },
};

export default function ProfileStrengthIndicator({
    profileCompleteness,
    dataSources = [],
    sourceCompleteness = {},
}: ProfileStrengthIndicatorProps) {
    const sources: SourceCompleteness[] = [];

    // Build per-source bars from sourceCompleteness or infer from dataSources
    const allSources = Object.keys(sourceCompleteness).length > 0
        ? Object.keys(sourceCompleteness)
        : [...new Set([...dataSources, "google_places", "website_scan", "owner_survey", "ai_context"])];

    allSources.forEach((key) => {
        const { label, icon } = SOURCE_LABELS[key] ?? { label: key, icon: BarChart3 };
        const pct = sourceCompleteness[key] ?? (dataSources.includes(key) ? 80 : 0);
        sources.push({ source: key, label, pct, icon });
    });

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profile Strength
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-display tracking-tight">
                        {profileCompleteness}%
                    </span>
                    <Badge
                        variant={profileCompleteness >= 70 ? "default" : "secondary"}
                        className={
                            profileCompleteness >= 70
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : ""
                        }
                    >
                        {profileCompleteness >= 70 ? "Strong" : profileCompleteness >= 40 ? "Moderate" : "Needs data"}
                    </Badge>
                </div>
                <div className="space-y-2">
                    {sources.map(({ source, label, pct, icon: Icon }) => (
                        <div key={source} className="flex items-center gap-2">
                            <Icon className="size-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary/60 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                                {pct}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
