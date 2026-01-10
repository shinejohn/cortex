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
import { Calendar, CheckCircle, DollarSign, BarChart3, Users, Music, Ticket, ShoppingBag, Globe, CalendarDays, ArrowRight, Star } from "lucide-react";
import { useState } from "react";

interface Props {
    auth: Auth;
}

export default function PerformerOnboarding() {
    const { auth } = usePage<Props>().props;
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category: "",
        genres: [] as string[],
        bio: "",
        location: "",
        price_range: "",
        image: null as File | null,
        social_links: {} as Record<string, string>,
    });

    const handleContinue = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        post("/performers", {
            onSuccess: (page) => {
                const performer = (page.props as any).performer;
                router.visit(`/performers/${performer.id}`);
            },
        });
    };

    return (
        <div className="min-h-screen bg-card">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Performer Onboarding - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-primary text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">Grow Your Performance Career</h1>
                        <p className="mt-6 text-xl max-w-3xl mx-auto">
                            GoEventCity connects performers with venues, events, and fans to help you book more gigs, grow your audience, and increase
                            your income.
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="w-full">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        currentStep >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    <span className="font-medium">1</span>
                                </div>
                                <span className="text-sm mt-2">Learn</span>
                            </div>
                            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`}></div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        currentStep >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    <span className="font-medium">2</span>
                                </div>
                                <span className="text-sm mt-2">Payment</span>
                            </div>
                            <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`}></div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        currentStep >= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    <span className="font-medium">3</span>
                                </div>
                                <span className="text-sm mt-2">Profile</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 1: How It Works */}
                {currentStep === 1 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>How GoEventCity Works for Performers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-primary">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-foreground">Book More Gigs</h3>
                                        <p className="mt-2 text-muted-foreground">
                                            Get discovered by venues and event organizers looking for talent like you.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-primary">
                                            <Users className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-foreground">Grow Your Audience</h3>
                                        <p className="mt-2 text-muted-foreground">Promote your upcoming shows to our community of local event-goers.</p>
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-primary">
                                            <DollarSign className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-foreground">Increase Your Income</h3>
                                        <p className="mt-2 text-muted-foreground">
                                            Set your rates, negotiate terms, and get paid securely through our platform.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-foreground mb-4">What's Included:</h3>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                    <span>Professional performer profile visible to venues and fans</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                    <span>Access to the gig marketplace with new opportunities daily</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                    <span>Promotion of your events on our platform and social media</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                    <span>Secure payment processing with direct deposits</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                    <span>Performance analytics and audience insights</span>
                                </li>
                            </ul>

                            <div className="flex justify-center">
                                <Button onClick={handleContinue}>
                                    Continue to Subscription Options
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Payment Options */}
                {currentStep === 2 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Choose Your Subscription Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Basic Plan */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-primary mb-4">
                                            $9.99<span className="text-base font-normal text-muted-foreground">/month</span>
                                        </div>
                                        <p className="text-muted-foreground mb-6">Perfect for solo performers just getting started</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Standard performer profile</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Apply to up to 10 gigs per month</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Basic analytics</span>
                                            </li>
                                        </ul>
                                        <Button variant="outline" className="w-full">
                                            Select Plan
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Pro Plan */}
                                <Card className="border-2 border-purple-500 relative">
                                    <div className="absolute top-0 right-0 bg-accent/500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                        POPULAR
                                    </div>
                                    <CardHeader>
                                        <CardTitle>Pro</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-primary mb-4">
                                            $24.99<span className="text-base font-normal text-muted-foreground">/month</span>
                                        </div>
                                        <p className="text-muted-foreground mb-6">For active performers looking to grow</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Featured performer profile</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Unlimited gig applications</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Advanced analytics</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Priority support</span>
                                            </li>
                                        </ul>
                                        <Button className="w-full">Select Plan</Button>
                                    </CardContent>
                                </Card>

                                {/* Premium Plan */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Premium</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-primary mb-4">
                                            $49.99<span className="text-base font-normal text-muted-foreground">/month</span>
                                        </div>
                                        <p className="text-muted-foreground mb-6">For professional bands and established performers</p>
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Premium featured profile</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Unlimited gig applications</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Premium placement in search</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                                <span>Dedicated account manager</span>
                                            </li>
                                        </ul>
                                        <Button variant="outline" className="w-full">
                                            Select Plan
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="text-center mb-8">
                                <p className="text-muted-foreground">All plans include a 14-day free trial. Cancel anytime.</p>
                            </div>

                            <div className="flex justify-center">
                                <Button onClick={handleContinue}>
                                    Continue to Profile Setup
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Profile Setup */}
                {currentStep === 3 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Set Up Your Performer Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                                className="space-y-6"
                            >
                                <div>
                                    <Label htmlFor="name">Performer/Band Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Your stage name or band name"
                                        className={errors.name ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category">Performance Category *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData("category", value)}>
                                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="band">Band</SelectItem>
                                            <SelectItem value="solo-musician">Solo Musician</SelectItem>
                                            <SelectItem value="dj">DJ</SelectItem>
                                            <SelectItem value="comedian">Comedian</SelectItem>
                                            <SelectItem value="dancer">Dancer</SelectItem>
                                            <SelectItem value="speaker">Speaker</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="bio">Bio/Description *</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData("bio", e.target.value)}
                                        rows={4}
                                        placeholder="Tell venues and fans about yourself, your music, and your performance style"
                                        className={errors.bio ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.bio && <p className="mt-1 text-sm text-destructive">{errors.bio}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="location">Home Location *</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData("location", e.target.value)}
                                        placeholder="City, State"
                                        className={errors.location ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.location && <p className="mt-1 text-sm text-destructive">{errors.location}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="price-range">Typical Price Range *</Label>
                                    <Select value={data.price_range} onValueChange={(value) => setData("price_range", value)}>
                                        <SelectTrigger className={errors.price_range ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select price range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="$">$ (Under $200)</SelectItem>
                                            <SelectItem value="$$">$$ ($200-$500)</SelectItem>
                                            <SelectItem value="$$$">$$$ ($500-$1000)</SelectItem>
                                            <SelectItem value="$$$$">$$$$ ($1000+)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.price_range && <p className="mt-1 text-sm text-destructive">{errors.price_range}</p>}
                                </div>

                                <div className="flex justify-center">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? "Creating Profile..." : "Complete Profile Setup"}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Testimonials */}
                <Card className="mt-12 bg-accent/50">
                    <CardHeader>
                        <CardTitle className="text-center">What Performers Say About Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    "I've booked 12 gigs in my first month using GoEventCity. The platform connects me directly with venues looking
                                    for my style of music."
                                </p>
                                <div className="font-medium">
                                    <p className="text-foreground">Sarah Johnson</p>
                                    <p className="text-muted-foreground text-sm">Folk Singer-Songwriter</p>
                                </div>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    "As a DJ, I was struggling to find consistent work. Since joining GoEventCity, I'm now booked solid every weekend
                                    and have raised my rates."
                                </p>
                                <div className="font-medium">
                                    <p className="text-foreground">DJ Coastal</p>
                                    <p className="text-muted-foreground text-sm">Electronic Music DJ</p>
                                </div>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    "Our band has grown our local following by 300% in just 6 months. The exposure through GoEventCity has been
                                    incredible for us."
                                </p>
                                <div className="font-medium">
                                    <p className="text-foreground">The Sunset Vibes</p>
                                    <p className="text-muted-foreground text-sm">Indie Rock Band</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}
