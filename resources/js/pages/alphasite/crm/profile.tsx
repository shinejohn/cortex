import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import ProfileStrengthIndicator from "@/components/alphasite/ProfileStrengthIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Quote,
    Lightbulb,
    Users,
    TrendingUp,
    Database,
    RefreshCw,
    MessageSquare,
    Target
} from "lucide-react";
import { smbService } from "@/lib/api/smbService";
import type { SmbFullProfile } from "@/types/smb";

interface Business {
    id: string;
    name: string;
    slug: string;
    smb_business_id?: string | null;
}

interface Props {
    business: Business;
    fullProfile: SmbFullProfile | null;
    subscription: Record<string, unknown> | null;
}

export default function ProfilePage({ business, fullProfile: initialProfile, subscription }: Props) {
    const [fullProfile, setFullProfile] = useState<SmbFullProfile | null>(initialProfile);
    const [loading, setLoading] = useState(false);
    const [enriching, setEnriching] = useState(false);

    useEffect(() => {
        setFullProfile(initialProfile);
    }, [initialProfile]);

    const fetchProfile = async () => {
        if (!business.smb_business_id) return;
        setLoading(true);
        try {
            const { data } = await smbService.getFullProfile(business.smb_business_id);
            setFullProfile(data);
        } finally {
            setLoading(false);
        }
    };

    const handleEnrich = async () => {
        if (!business.smb_business_id) return;
        setEnriching(true);
        try {
            await smbService.requestEnrichment(business.smb_business_id);
            await fetchProfile();
        } finally {
            setEnriching(false);
        }
    };

    const profile = fullProfile;

    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription as { tier: string; status: string; trial_expires_at: string | null; ai_services_enabled: string[] } | null}
            title="Business Profile"
        >
            <Head title={`Business Profile | ${business.name}`} />

            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                            Intelligence Hub
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your evolving business profile powers all AI tools and campaigns
                        </p>
                    </div>
                    {business.smb_business_id && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchProfile}
                                disabled={loading}
                            >
                                <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEnrich}
                                disabled={enriching}
                            >
                                <Database className="size-4 mr-2" />
                                Re-Enrich
                            </Button>
                        </div>
                    )}
                </div>

                {!profile ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Database className="size-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {business.smb_business_id
                                    ? "Profile data will appear here once linked to Command Center."
                                    : "Link this business to Command Center to see your full intelligence profile."}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Your profile aggregates data from Google, website scans, surveys, and AI context.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <ProfileStrengthIndicator
                                    profileCompleteness={profile.profile_completeness ?? 0}
                                    dataSources={profile.data_sources ?? []}
                                />
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                {profile.data_sources && profile.data_sources.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                                            <CardDescription>Sources that contributed to this profile</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.data_sources.map((src) => (
                                                    <Badge key={src} variant="secondary">
                                                        {src.replace(/_/g, " ")}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                {profile.last_enriched_at && (
                                    <p className="text-xs text-muted-foreground">
                                        Last enriched: {new Date(profile.last_enriched_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* AI Profile */}
                        {profile.ai_context && Object.keys(profile.ai_context).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="size-5" />
                                        AI Profile
                                    </CardTitle>
                                    <CardDescription>Tone, story angles, and approved quotes for AI content</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {profile.ai_context.tone_and_voice && profile.ai_context.tone_and_voice.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Tone & Voice</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.ai_context.tone_and_voice.map((t) => (
                                                    <Badge key={t} variant="outline">{t}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile.ai_context.story_angles && profile.ai_context.story_angles.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                                                <Lightbulb className="size-4" /> Story Angles
                                            </h4>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                {profile.ai_context.story_angles.map((a) => (
                                                    <li key={a}>{a}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {profile.ai_context.approved_quotes && profile.ai_context.approved_quotes.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                                                <Quote className="size-4" /> Approved Quotes
                                            </h4>
                                            <div className="space-y-2">
                                                {profile.ai_context.approved_quotes.map((q, i) => (
                                                    <blockquote
                                                        key={i}
                                                        className="border-l-2 border-primary/30 pl-4 py-1 text-sm italic"
                                                    >
                                                        "{q.text}" — {q.attribution}
                                                    </blockquote>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Customer Intelligence */}
                        {profile.customer_intelligence && Object.keys(profile.customer_intelligence).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="size-5" />
                                        Customer Intelligence
                                    </CardTitle>
                                    <CardDescription>Perception gaps, NPS, and feedback themes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {profile.customer_intelligence.net_promoter_score != null && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Net Promoter Score</h4>
                                            <p className="text-2xl font-bold">{profile.customer_intelligence.net_promoter_score}</p>
                                        </div>
                                    )}
                                    {profile.customer_intelligence.top_praised_features && profile.customer_intelligence.top_praised_features.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Top Praised</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.customer_intelligence.top_praised_features.map((f) => (
                                                    <Badge key={f} variant="secondary">{f}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile.customer_intelligence.common_complaints && profile.customer_intelligence.common_complaints.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Common Complaints</h4>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                {profile.customer_intelligence.common_complaints.map((c) => (
                                                    <li key={c}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Competitive Intel */}
                        {profile.competitor_analysis && Object.keys(profile.competitor_analysis).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="size-5" />
                                        Competitive Intel
                                    </CardTitle>
                                    <CardDescription>Market position and differentiation</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {profile.competitor_analysis.market_position && (
                                        <p className="text-sm">
                                            <span className="font-medium">Position:</span>{" "}
                                            {profile.competitor_analysis.market_position}
                                        </p>
                                    )}
                                    {profile.competitor_analysis.direct_competitors && profile.competitor_analysis.direct_competitors.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Direct Competitors</h4>
                                            <div className="space-y-2">
                                                {profile.competitor_analysis.direct_competitors.map((c, i) => (
                                                    <div key={i} className="text-sm">
                                                        <span className="font-medium">{c.name}</span>
                                                        {c.strengths && c.strengths.length > 0 && (
                                                            <span className="text-muted-foreground ml-2">
                                                                Strengths: {c.strengths.join(", ")}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile.competitor_analysis.differentiation_opportunities && profile.competitor_analysis.differentiation_opportunities.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Opportunities</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.competitor_analysis.differentiation_opportunities.map((o) => (
                                                    <Badge key={o} variant="outline">{o}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Campaign History */}
                        {profile.campaign_history && profile.campaign_history.total_campaigns != null && profile.campaign_history.total_campaigns > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="size-5" />
                                        Campaign History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-2xl font-bold">{profile.campaign_history.total_campaigns}</p>
                                            <p className="text-xs text-muted-foreground">Total Campaigns</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{profile.campaign_history.total_emails_sent ?? 0}</p>
                                            <p className="text-xs text-muted-foreground">Emails Sent</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{profile.campaign_history.avg_open_rate ?? 0}%</p>
                                            <p className="text-xs text-muted-foreground">Avg Open Rate</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{profile.campaign_history.avg_click_rate ?? 0}%</p>
                                            <p className="text-xs text-muted-foreground">Avg Click Rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AlphasiteCrmLayout>
    );
}
