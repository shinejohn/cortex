import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { ChevronLeft, Save, Eye, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Props {
    auth: Auth;
}

type BuilderStep = "setup" | "design" | "sections" | "permissions" | "monetization" | "preview";

export default function HubCreate() {
    const { auth } = usePage<Props>().props;
    const [activeStep, setActiveStep] = useState<BuilderStep>("setup");
    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        slug: "",
        description: "",
        category: "",
        subcategory: "",
        location: "",
        website: "",
        contact_email: "",
        contact_phone: "",
        about: "",
        social_links: {},
        design_settings: {},
        monetization_settings: {},
        analytics_enabled: true,
        articles_enabled: true,
        community_enabled: true,
        events_enabled: true,
        gallery_enabled: true,
        performers_enabled: true,
        venues_enabled: true,
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    };

    const handleNameChange = (value: string) => {
        setData("name", value);
        if (!data.slug) {
            setData("slug", generateSlug(value));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/hubs", {
            onSuccess: (page) => {
                const hub = (page.props as any).hub;
                router.visit(`/hubs/${hub.slug}`);
            },
        });
    };

    const steps: BuilderStep[] = ["setup", "design", "sections", "permissions", "monetization", "preview"];

    const renderStepContent = () => {
        switch (activeStep) {
            case "setup":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hub Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="name">Hub Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g., Jazz Lovers Community"
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="slug">URL Slug *</Label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        hub/
                                    </span>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData("slug", e.target.value.replace(/[^a-z0-9-]/g, ""))}
                                        placeholder="jazz-lovers-community"
                                        className={`rounded-none ${errors.slug ? "border-red-500" : ""}`}
                                    />
                                    <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        .com
                                    </span>
                                </div>
                                {errors.slug && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select value={data.category} onValueChange={(value) => setData("category", value)}>
                                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="music">Music</SelectItem>
                                        <SelectItem value="arts">Arts & Culture</SelectItem>
                                        <SelectItem value="sports">Sports & Recreation</SelectItem>
                                        <SelectItem value="food">Food & Drink</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="business">Business & Entrepreneurship</SelectItem>
                                        <SelectItem value="education">Education & Learning</SelectItem>
                                        <SelectItem value="health">Health & Wellness</SelectItem>
                                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                        <SelectItem value="community">Community & Causes</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    placeholder="Describe the purpose and mission of your hub"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData("location", e.target.value)}
                                    placeholder="e.g., Clearwater, FL"
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            case "preview":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hub Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-6">
                                Review your hub before publishing. You can go back to any section to make changes.
                            </p>
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-8">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-2">{data.name || "Hub Name"}</h3>
                                    <p className="text-gray-600">{data.description || "Hub description"}</p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? "Publishing..." : "Publish Hub"}
                                </Button>
                                <p className="mt-2 text-sm text-gray-500 text-center">
                                    Publishing will make your hub visible to the public.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>{activeStep.charAt(0).toUpperCase() + activeStep.slice(1)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">This section is coming soon.</p>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Create New Hub - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit("/hubs")}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <ChevronLeft className="h-5 w-5 mr-1" />
                                Back to Hubs
                            </Button>
                            <h1 className="ml-6 text-xl font-bold text-gray-900">Create New Hub</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                {showPreview ? "Hide Preview" : "Show Preview"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <Card>
                            <CardContent className="p-4">
                                <nav className="space-y-2">
                                    {steps.map((step, index) => (
                                        <button
                                            key={step}
                                            onClick={() => setActiveStep(step)}
                                            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                activeStep === step
                                                    ? "bg-indigo-100 text-indigo-700"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                        >
                                            {index + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
                                        </button>
                                    ))}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        {activeStep !== "preview" && (
                            <div className="mt-8 flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const currentIndex = steps.indexOf(activeStep);
                                        if (currentIndex > 0) {
                                            setActiveStep(steps[currentIndex - 1]);
                                        }
                                    }}
                                    disabled={activeStep === "setup"}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => {
                                        const currentIndex = steps.indexOf(activeStep);
                                        if (currentIndex < steps.length - 1) {
                                            setActiveStep(steps[currentIndex + 1]);
                                        }
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="w-full lg:w-1/3 flex-shrink-0">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-4">
                                        <div className="text-center">
                                            <h3 className="text-lg font-bold mb-2">{data.name || "Hub Name"}</h3>
                                            <p className="text-sm text-gray-600">{data.description || "Hub description"}</p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500">
                                        This is a simplified preview. Some features may appear different in the final version.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

