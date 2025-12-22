import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Auth } from "@/types";
import { usePage } from "@inertiajs/react";
import { FileText, Download, Calendar, User } from "lucide-react";

interface PressRelease {
    id: string;
    title: string;
    date: string;
    category: string;
    summary: string;
    download_url?: string;
}

interface MediaContact {
    name: string;
    role: string;
    email: string;
    phone: string;
}

interface Props {
    auth: Auth;
    pressReleases: PressRelease[];
    mediaContacts: MediaContact[];
}

export default function Press() {
    const { auth, pressReleases, mediaContacts } = usePage<Props>().props;

    return (
        <div className="min-h-screen bg-white">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Press - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4" />
                    <h1 className="text-5xl font-bold mb-4">Press & Media</h1>
                    <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
                        Latest news, press releases, and media resources
                    </p>
                </div>
            </div>

            {/* Press Releases */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Press Releases</h2>
                <div className="space-y-6">
                    {pressReleases.map((release) => (
                        <Card key={release.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-medium text-indigo-600">{release.category}</span>
                                            <span className="text-sm text-gray-500">
                                                <Calendar className="h-4 w-4 inline mr-1" />
                                                {new Date(release.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{release.title}</h3>
                                        <p className="text-gray-700 mb-4">{release.summary}</p>
                                    </div>
                                    {release.download_url && (
                                        <Button variant="outline">
                                            <Download className="h-5 w-5 mr-2" />
                                            Download
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Media Contacts */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Media Contacts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mediaContacts.map((contact, index) => (
                            <Card key={index}>
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                                            <User className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                                            <p className="text-sm text-gray-600">{contact.role}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Email:</span> {contact.email}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Phone:</span> {contact.phone}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Media Kit */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Kit</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Download our media kit with logos, brand guidelines, and high-resolution images
                        </p>
                        <Button size="lg">
                            <Download className="h-5 w-5 mr-2" />
                            Download Media Kit
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}

