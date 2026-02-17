import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, Link } from "@inertiajs/react";
import { Auth } from "@/types";
import { MapPin, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Business {
    id: string;
    name: string;
    slug: string;
    latitude: string;
    longitude: string; // These come as strings from DB often
    address: string;
    city: string;
    categories: string[];
    rating: number;
    reviews_count: number;
    images: string[];
}

interface MapIndexProps {
    auth: Auth;
    businesses: Business[];
}

export default function MapIndex({ auth, businesses }: MapIndexProps) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Map & Locations",
                description: "Explore downtown businesses on the map",
            }}
        >
            <Head title="Map" />

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar List */}
                <div className="w-1/3 bg-white border-r overflow-y-auto hidden md:block">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Downtown Locations</h2>
                        <p className="text-sm text-gray-500">{businesses.length} businesses found</p>
                    </div>
                    <div className="divide-y">
                        {businesses.map((business) => (
                            <div key={business.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <Link href={route('downtown-guide.businesses.show', business.slug)}>
                                    <h3 className="font-medium text-gray-900 hover:text-indigo-600">{business.name}</h3>
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">{business.address}, {business.city}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                        <span>{business.rating || 'N/A'} ({business.reviews_count || 0})</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>{business.categories?.[0] || 'Business'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {businesses.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No locations found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
                    {/* Map Component Placeholder */}
                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/0,0,1,0,0/600x600?access_token=none')] bg-cover bg-center opacity-10"></div>
                    <div className="text-center p-8 bg-white/90 backdrop-blur rounded-xl shadow-2xl max-w-md relative z-10 border border-indigo-100">
                        <div className="bg-indigo-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <Navigation className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Map</h3>
                        <p className="text-gray-600 mb-6">
                            Our interactive map feature is currently being optimized.
                            <br />You can still browse all {businesses.length} locations using the list on the left.
                        </p>
                        <Button asChild className="w-full">
                            <Link href={route('downtown-guide.businesses.index') as string}>
                                Browse Directory
                            </Link>
                        </Button>
                    </div>

                    {/* Temporary visual indication of 'pins' */}
                    <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, #6366f1 2px, transparent 2.5px)',
                        backgroundSize: '30px 30px'
                    }}></div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
