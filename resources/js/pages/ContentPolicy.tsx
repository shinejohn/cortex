import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentPolicyProps {
    lastUpdated: string;
}

export default function ContentPolicy({ lastUpdated }: ContentPolicyProps) {
    return (
        <>
            <Head title="Content Standards Policy" />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
                        <h1 className="mt-2 text-3xl font-bold">Day.News Content Standards Policy</h1>
                        <p className="mt-2 text-muted-foreground">
                            Our content standards exist to maintain a safe, trustworthy platform for community news and engagement.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Section 3.1 — Absolute Violations</CardTitle>
                                <CardDescription>Content that will always be rejected</CardDescription>
                            </CardHeader>
                            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                <ul>
                                    <li>Direct threats of violence against individuals or groups</li>
                                    <li>Explicit hate speech (slurs, dehumanizing language targeting protected characteristics)</li>
                                    <li>Sexually explicit content or child safety violations</li>
                                    <li>Doxing (posting private personal information to harass)</li>
                                    <li>Spam or promotional manipulation</li>
                                    <li>Illegal content (drug sales, weapons, etc.)</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Section 3.2 — Conditional Violations</CardTitle>
                                <CardDescription>Content that may be rejected depending on context</CardDescription>
                            </CardHeader>
                            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                <ul>
                                    <li>Misinformation that could cause imminent harm</li>
                                    <li>Harassment or coordinated abuse</li>
                                    <li>Graphic violence without news value</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Section 3.3 — Protected Content</CardTitle>
                                <CardDescription>Content that is explicitly protected and will not be rejected</CardDescription>
                            </CardHeader>
                            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                <ul>
                                    <li>Opinions, including unpopular opinions</li>
                                    <li>Political viewpoints of all kinds</li>
                                    <li>Criticism of businesses, government, and public figures</li>
                                    <li>Satire and humor</li>
                                    <li>Strong disagreement and rudeness (when not threats)</li>
                                    <li>News reporting on controversial topics</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Filing a Complaint</CardTitle>
                                <CardDescription>Report content that you believe violates our standards</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Use the &quot;Report Content&quot; button on any article, event, or comment to report content that violates our policy. You must be logged in to file a complaint.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Filing an Appeal</CardTitle>
                                <CardDescription>If your content was rejected</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    If your content was rejected and you believe the decision was made in error, you may file an appeal. The link to file an appeal is provided in the rejection notification email you receive.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/"
                            className="text-sm text-primary hover:underline"
                        >
                            ← Back to Day.News
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
