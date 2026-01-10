import { router, useForm, usePage } from "@inertiajs/react";
import { ArrowRight, CheckCircle, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Auth } from "@/types";

interface Props {
    auth: Auth;
}

export default function SubmitVenue() {
    const { auth } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        category: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "United States",
        phone: "",
        email: "",
        website: "",
        capacity: "",
        amenities: [] as string[],
        images: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/venues", {
            onSuccess: (page) => {
                const venue = (page.props as { venue?: { id: string } }).venue;
                if (venue?.id) {
                    router.visit(`/venues/${venue.id}`);
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "List Your Venue - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">List Your Venue</h1>
                        <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
                            Reach thousands of event organizers and performers looking for the perfect space.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Card>
                    <CardHeader>
                        <CardTitle>Venue Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Venue Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="e.g., The Jazz Club"
                                    className={errors.name ? "border-red-500" : ""}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select value={data.category} onValueChange={(value) => setData("category", value)}>
                                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="music-venue">Music Venue</SelectItem>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="theater">Theater</SelectItem>
                                        <SelectItem value="outdoor">Outdoor Space</SelectItem>
                                        <SelectItem value="conference">Conference Center</SelectItem>
                                        <SelectItem value="sports">Sports Venue</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    rows={4}
                                    placeholder="Describe your venue, its atmosphere, and what makes it special"
                                    className={errors.description ? "border-red-500" : ""}
                                    required
                                />
                                {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        placeholder="Street address"
                                        className={errors.address ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData("city", e.target.value)}
                                        placeholder="City"
                                        className={errors.city ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.city && <p className="mt-1 text-sm text-destructive">{errors.city}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="state">State *</Label>
                                    <Input
                                        id="state"
                                        value={data.state}
                                        onChange={(e) => setData("state", e.target.value)}
                                        placeholder="State"
                                        className={errors.state ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.state && <p className="mt-1 text-sm text-destructive">{errors.state}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="zip_code">ZIP Code *</Label>
                                    <Input
                                        id="zip_code"
                                        value={data.zip_code}
                                        onChange={(e) => setData("zip_code", e.target.value)}
                                        placeholder="ZIP Code"
                                        className={errors.zip_code ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.zip_code && <p className="mt-1 text-sm text-destructive">{errors.zip_code}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData("phone", e.target.value)}
                                        placeholder="(555) 123-4567"
                                        className={errors.phone ? "border-red-500" : ""}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="venue@example.com"
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData("website", e.target.value)}
                                    placeholder="https://example.com"
                                    className={errors.website ? "border-red-500" : ""}
                                />
                                {errors.website && <p className="mt-1 text-sm text-destructive">{errors.website}</p>}
                            </div>

                            <div>
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={data.capacity}
                                    onChange={(e) => setData("capacity", e.target.value)}
                                    placeholder="Maximum capacity"
                                    className={errors.capacity ? "border-red-500" : ""}
                                />
                                {errors.capacity && <p className="mt-1 text-sm text-destructive">{errors.capacity}</p>}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => router.visit("/venues")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? "Submitting..." : "Submit Venue"}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Benefits Section */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Benefits of Listing Your Venue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Reach More Customers</h3>
                                    <p className="text-muted-foreground mt-1">
                                        Get discovered by event organizers and performers actively looking for venues.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Easy Booking Management</h3>
                                    <p className="text-muted-foreground mt-1">Manage availability, bookings, and payments all in one place.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Increase Revenue</h3>
                                    <p className="text-muted-foreground mt-1">Fill empty dates and maximize your venue's earning potential.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Build Your Reputation</h3>
                                    <p className="text-muted-foreground mt-1">Collect reviews and ratings to build trust with potential customers.</p>
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
