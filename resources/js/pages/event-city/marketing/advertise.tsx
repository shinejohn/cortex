import { router, useForm, usePage } from "@inertiajs/react";
import { ArrowRight, CheckCircle, Megaphone, Target, TrendingUp, Users } from "lucide-react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Auth } from "@/types";

interface Props {
    auth: Auth;
}

export default function Advertise() {
    const { auth } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
        budget: "",
        campaign_type: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/marketing/advertise", {
            onSuccess: () => {
                router.visit("/marketing/advertise/thank-you");
            },
        });
    };

    return (
        <div className="min-h-screen bg-card">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Advertise With Us - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Megaphone className="h-16 w-16 mx-auto mb-6" />
                    <h1 className="text-5xl font-display font-black tracking-tight mb-4">Advertise With GoEventCity</h1>
                    <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
                        Reach thousands of event-goers, performers, and venue owners in your local area
                    </p>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-display font-black tracking-tight text-foreground text-center mb-12">Why Advertise With Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Targeted Audience</h3>
                            <p className="text-muted-foreground">Reach people actively looking for events, venues, and performers in your area</p>
                        </CardContent>
                    </Card>
                    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">High Engagement</h3>
                            <p className="text-muted-foreground">
                                Our users are highly engaged and actively planning events, making them ideal customers
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Local Focus</h3>
                            <p className="text-muted-foreground">Target specific cities, neighborhoods, and event categories for maximum relevance</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Advertising Options */}
                <div className="mb-16">
                    <h2 className="text-3xl font-display font-black tracking-tight text-foreground text-center mb-12">Advertising Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>Event Listings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                        <span>Featured placement in event listings</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                        <span>Priority in search results</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                        <span>Enhanced visibility with badges</span>
                                    </li>
                                </ul>
                                <p className="text-2xl font-bold text-foreground mb-2">Starting at $99/month</p>
                            </CardContent>
                        </Card>
                        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>Banner Advertising</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                        <span>Display ads on high-traffic pages</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                        <span>Multiple ad sizes available</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                        <span>Geo-targeted campaigns</span>
                                    </li>
                                </ul>
                                <p className="text-2xl font-bold text-foreground mb-2">Starting at $299/month</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Contact Form */}
                <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Get Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className={errors.name ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className={errors.email ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="company">Company</Label>
                                    <Input id="company" value={data.company} onChange={(e) => setData("company", e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" type="tel" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="campaign_type">Campaign Type</Label>
                                <select
                                    id="campaign_type"
                                    value={data.campaign_type}
                                    onChange={(e) => setData("campaign_type", e.target.value)}
                                    className="w-full border rounded-md p-2"
                                >
                                    <option value="">Select campaign type</option>
                                    <option value="event-listing">Event Listing</option>
                                    <option value="banner-ad">Banner Ad</option>
                                    <option value="sponsored-content">Sponsored Content</option>
                                    <option value="email-marketing">Email Marketing</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="budget">Budget Range</Label>
                                <select
                                    id="budget"
                                    value={data.budget}
                                    onChange={(e) => setData("budget", e.target.value)}
                                    className="w-full border rounded-md p-2"
                                >
                                    <option value="">Select budget range</option>
                                    <option value="under-500">Under $500/month</option>
                                    <option value="500-1000">$500 - $1,000/month</option>
                                    <option value="1000-5000">$1,000 - $5,000/month</option>
                                    <option value="5000-plus">$5,000+/month</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData("message", e.target.value)}
                                    rows={4}
                                    placeholder="Tell us about your advertising needs..."
                                />
                            </div>
                            <Button type="submit" disabled={processing} size="lg" className="w-full">
                                {processing ? "Submitting..." : "Submit Inquiry"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}
