import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Auth } from "@/types";
import { usePage } from "@inertiajs/react";
import { Handshake, Users, TrendingUp, Award, CheckCircle, ArrowRight } from "lucide-react";

interface Props {
    auth: Auth;
}

export default function Partner() {
    const { auth } = usePage<Props>().props;

    return (
        <div className="min-h-screen bg-white">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Partner With Us - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Handshake className="h-16 w-16 mx-auto mb-4" />
                    <h1 className="text-5xl font-bold mb-4">Partner With GoEventCity</h1>
                    <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
                        Join our network of partners and help shape the future of local events
                    </p>
                </div>
            </div>

            {/* Partnership Types */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Partnership Opportunities</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <Card>
                        <CardHeader>
                            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-indigo-600" />
                            </div>
                            <CardTitle>Venue Partners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Connect your venue with our platform and reach more event organizers</p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Increased bookings</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Marketing support</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Analytics dashboard</span>
                                </li>
                            </ul>
                            <Button className="w-full">Learn More</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                            <CardTitle>Technology Partners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Integrate your services with our platform and expand your reach</p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>API access</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Co-marketing opportunities</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Technical support</span>
                                </li>
                            </ul>
                            <Button className="w-full">Learn More</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <Award className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle>Media Partners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Collaborate on content and reach new audiences together</p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Content collaboration</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Cross-promotion</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                    <span>Event coverage</span>
                                </li>
                            </ul>
                            <Button className="w-full">Learn More</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Benefits */}
                <div className="bg-gray-50 rounded-lg p-8 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Partnership Benefits</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Dedicated Support</h3>
                                <p className="text-gray-600">Get dedicated account management and priority support</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Marketing Resources</h3>
                                <p className="text-gray-600">Access to marketing materials and co-branded assets</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Revenue Sharing</h3>
                                <p className="text-gray-600">Earn revenue through referrals and partnerships</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Early Access</h3>
                                <p className="text-gray-600">Be the first to access new features and opportunities</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Partner With Us?</h2>
                    <p className="text-xl text-gray-600 mb-8">Let's work together to create amazing experiences for your community</p>
                    <Button size="lg">
                        Contact Partnership Team
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    );
}
