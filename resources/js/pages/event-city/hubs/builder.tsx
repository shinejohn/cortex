import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Auth } from "@/types";
import { router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useState } from "react";

interface Hub {
    id: string;
    name: string;
    slug: string;
    design_settings: Record<string, any>;
    sections: Array<{
        id: string;
        type: string;
        title: string;
        is_visible: boolean;
        sort_order: number;
    }>;
}

interface Props {
    auth: Auth;
    hub: Hub;
}

export default function HubBuilder() {
    const { auth, hub } = usePage<Props>().props;
    const [activeTab, setActiveTab] = useState("design");

    const { data, setData, patch, processing } = useForm({
        design_settings: hub.design_settings || {},
        sections: hub.sections || [],
    });

    const handleSaveDesign = () => {
        patch(`/hubs/${hub.slug}/builder/design`, {
            preserveScroll: true,
        });
    };

    const handleSaveSections = () => {
        patch(`/hubs/${hub.slug}/builder/sections`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: `Hub Builder - ${hub.name} - GoEventCity`,
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Button variant="ghost" onClick={() => router.visit(`/hubs/${hub.slug}`)} className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="h-5 w-5 mr-1" />
                                Back to Hub
                            </Button>
                            <h1 className="ml-6 text-xl font-bold text-gray-900">Hub Builder</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" onClick={() => router.visit(`/hubs/${hub.slug}/preview`)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="design">Design</TabsTrigger>
                        <TabsTrigger value="sections">Sections</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        <TabsTrigger value="monetization">Monetization</TabsTrigger>
                    </TabsList>

                    <TabsContent value="design" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Design Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">Customize your hub's appearance.</p>
                                <Button onClick={handleSaveDesign} disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? "Saving..." : "Save Design"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sections" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Sections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">Configure which sections appear on your hub.</p>
                                <div className="space-y-4">
                                    {hub.sections.map((section) => (
                                        <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{section.title}</div>
                                                <div className="text-sm text-gray-500">{section.type}</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={section.is_visible}
                                                    onChange={(e) => {
                                                        const updatedSections = data.sections.map((s: any) =>
                                                            s.id === section.id ? { ...s, is_visible: e.target.checked } : s,
                                                        );
                                                        setData("sections", updatedSections);
                                                    }}
                                                    className="rounded"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={handleSaveSections} disabled={processing} className="mt-4">
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? "Saving..." : "Save Sections"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="permissions" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Permissions & Roles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Manage member permissions and roles.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monetization" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monetization</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Set up monetization options for your hub.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
