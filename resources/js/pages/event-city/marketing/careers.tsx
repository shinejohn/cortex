import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Auth } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { Briefcase, MapPin, Clock, ArrowRight, Users, Heart, Zap } from "lucide-react";

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    posted_date: string;
    description: string;
    requirements: string[];
}

interface Props {
    auth: Auth;
    jobs: Job[];
}

export default function Careers() {
    const { auth, jobs } = usePage<Props>().props;

    return (
        <div className="min-h-screen bg-white">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Careers - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Briefcase className="h-16 w-16 mx-auto mb-4" />
                    <h1 className="text-5xl font-bold mb-4">Join Our Team</h1>
                    <p className="text-xl text-indigo-100 max-w-3xl mx-auto">Help us build the future of local events and community connections</p>
                </div>
            </div>

            {/* Why Work Here */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Work at GoEventCity?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Great Culture</h3>
                            <p className="text-gray-600">Work with passionate people who care about building amazing experiences</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Growth</h3>
                            <p className="text-gray-600">Join a rapidly growing company with opportunities for career advancement</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Impact</h3>
                            <p className="text-gray-600">Make a real difference in how communities connect and celebrate</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Open Positions */}
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Open Positions</h2>
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                                            <Badge variant="outline">{job.department}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {job.type}
                                            </div>
                                            <div className="flex items-center">Posted {new Date(job.posted_date).toLocaleDateString()}</div>
                                        </div>
                                        <p className="text-gray-700 mb-4">{job.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {job.requirements.slice(0, 3).map((req, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {req}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={() => router.visit(`/careers/${job.id}`)}>
                                        Apply Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="bg-indigo-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Don't See a Role That Fits?</h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
                    </p>
                    <Button size="lg" variant="outline" className="bg-white text-indigo-700 hover:bg-indigo-50">
                        Submit General Application
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    );
}
