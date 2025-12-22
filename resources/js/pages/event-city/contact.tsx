import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Auth } from "@/types";
import { router, useForm, usePage } from "@inertiajs/react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

interface Props {
    auth: Auth;
}

export default function ContactPage() {
    const { auth } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user?.name || "",
        email: auth.user?.email || "",
        subject: "",
        category: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/contact", {
            onSuccess: () => {
                alert("Thank you for your message! We'll get back to you soon.");
                router.reload();
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Contact Us - GoEventCity",
                    description: "Get in touch with the GoEventCity team. We're here to help with questions, support, partnerships, and more.",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">Contact Us</h1>
                        <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
                            Have a question or want to get in touch? We'd love to hear from you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a message</CardTitle>
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
                                                required
                                                className={errors.name ? "border-red-500" : ""}
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData("email", e.target.value)}
                                                required
                                                className={errors.email ? "border-red-500" : ""}
                                            />
                                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={data.category} onValueChange={(value) => setData("category", value)}>
                                            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">General Inquiry</SelectItem>
                                                <SelectItem value="support">Support</SelectItem>
                                                <SelectItem value="partnership">Partnership</SelectItem>
                                                <SelectItem value="media">Media & Press</SelectItem>
                                                <SelectItem value="feedback">Feedback</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData("subject", e.target.value)}
                                            required
                                            className={errors.subject ? "border-red-500" : ""}
                                        />
                                        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e) => setData("message", e.target.value)}
                                            required
                                            rows={6}
                                            className={errors.message ? "border-red-500" : ""}
                                        />
                                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full">
                                        <Send className="h-4 w-4 mr-2" />
                                        {processing ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Get in Touch</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start">
                                    <Mail className="h-5 w-5 text-indigo-600 mr-3 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-gray-900">Email</div>
                                        <div className="text-gray-600">support@goeventcity.com</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Phone className="h-5 w-5 text-indigo-600 mr-3 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-gray-900">Phone</div>
                                        <div className="text-gray-600">(555) 123-4567</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-indigo-600 mr-3 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-gray-900">Address</div>
                                        <div className="text-gray-600">
                                            123 Event Street
                                            <br />
                                            Clearwater, FL 33755
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Office Hours</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monday - Friday</span>
                                        <span className="font-medium">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Saturday</span>
                                        <span className="font-medium">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sunday</span>
                                        <span className="font-medium">Closed</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="ghost" className="w-full justify-start" onClick={() => router.visit("/help")}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Help Center
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => router.visit("/about")}>
                                    About Us
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => router.visit("/partners")}>
                                    Partner With Us
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

