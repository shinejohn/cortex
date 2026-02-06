import { SEO } from "@/components/common/seo";
import { ClassifiedCard } from "@/components/day-news/classified-card";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { SavedClassifiedsPageProps } from "@/types/classified";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Bookmark, Package, ShoppingBag } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends SavedClassifiedsPageProps {
    auth?: Auth;
}

export default function SavedClassifieds({ auth, classifieds }: Props) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Saved Listings",
                        description: "View your saved classified listings.",
                        url: "/saved-classifieds",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("daynews.classifieds.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Classifieds
                            </Link>
                        </Button>
                    </div>

                    {/* Page header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
                                <Bookmark className="size-8" />
                                Saved Listings
                            </h1>
                            <p className="mt-1 text-muted-foreground">Listings you've saved for later</p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={route("daynews.classifieds.index")}>
                                <ShoppingBag className="mr-2 size-4" />
                                Browse Classifieds
                            </Link>
                        </Button>
                    </div>

                    {/* Saved classifieds grid */}
                    {classifieds.data.length > 0 ? (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {classifieds.data.map((classified) => (
                                    <ClassifiedCard key={classified.id} classified={classified} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {classifieds.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    {classifieds.prev_page_url && (
                                        <Button variant="outline" asChild>
                                            <Link href={classifieds.prev_page_url}>Previous</Link>
                                        </Button>
                                    )}
                                    <span className="px-4 text-sm text-muted-foreground">
                                        Page {classifieds.current_page} of {classifieds.last_page}
                                    </span>
                                    {classifieds.next_page_url && (
                                        <Button variant="outline" asChild>
                                            <Link href={classifieds.next_page_url}>Next</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <div className="text-center">
                                <Package className="mx-auto mb-4 size-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-bold">No Saved Listings</h3>
                                <p className="mx-auto max-w-md text-muted-foreground">
                                    You haven't saved any listings yet. Browse classifieds and save items you're
                                    interested in!
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href={route("daynews.classifieds.index")}>
                                        <ShoppingBag className="mr-2 size-4" />
                                        Browse Classifieds
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </LocationProvider>
    );
}
