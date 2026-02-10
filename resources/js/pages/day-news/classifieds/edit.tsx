import { SEO } from "@/components/common/seo";
import { ClassifiedForm } from "@/components/day-news/classified-form";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { ClassifiedEditPageProps } from "@/types/classified";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Edit } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends ClassifiedEditPageProps {
    auth: Auth;
}

export default function ClassifiedEdit({
    auth,
    classified,
    categorySpecifications,
    categories,
    conditions,
    priceTypes,
}: Props) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `Edit: ${classified.title}`,
                        description: "Update your classified listing details.",
                        url: `/classifieds/${classified.id}/edit`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                            <Link href={route("daynews.classifieds.my")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to My Listings
                            </Link>
                        </Button>
                    </div>

                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="flex items-center gap-2 font-display text-2xl font-black tracking-tight text-gray-900">
                            <Edit className="size-7 text-indigo-600" />
                            Edit Listing
                        </h1>
                        <p className="mt-2 text-gray-600">Update the details of your listing below.</p>
                    </div>

                    {/* Form */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm p-6">
                        <ClassifiedForm
                            categories={categories}
                            conditions={conditions}
                            priceTypes={priceTypes}
                            initialData={{
                                id: classified.id,
                                title: classified.title,
                                description: classified.description,
                                price: classified.price,
                                price_type: classified.price_type,
                                condition: classified.condition,
                                contact_email: classified.contact_email,
                                contact_phone: classified.contact_phone,
                                classified_category_id: classified.classified_category_id,
                                images: classified.images,
                                region_ids: classified.region_ids,
                                regions: classified.regions,
                                specifications: classified.specifications,
                                custom_attributes: classified.custom_attributes,
                            }}
                            categorySpecifications={categorySpecifications}
                            mode="edit"
                        />
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
