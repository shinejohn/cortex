import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { ClassifiedStatus, MyClassifiedsPageProps } from "@/types/classified";
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowLeft, CheckCircle, Edit, Eye, Package, Plus, ShoppingBag, Trash2, Undo2 } from "lucide-react";
import { route } from "ziggy-js";

dayjs.extend(relativeTime);

interface Props extends MyClassifiedsPageProps {
    auth?: Auth;
}

export default function MyClassifieds({ auth, classifieds }: Props) {
    const handleDelete = (classifiedId: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        router.delete(route("daynews.classifieds.destroy", { classified: classifiedId }));
    };

    const handleMarkSold = (classifiedId: string) => {
        if (!confirm("Mark this item as sold?")) return;
        router.post(route("daynews.classifieds.sold", { classified: classifiedId }));
    };

    const handleReactivate = (classifiedId: string) => {
        router.post(route("daynews.classifieds.reactivate", { classified: classifiedId }));
    };

    const getStatusBadge = (status: ClassifiedStatus) => {
        switch (status) {
            case "sold":
                return (
                    <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="size-3" />
                        Sold
                    </Badge>
                );
            case "removed":
                return <Badge variant="destructive">Removed</Badge>;
            default:
                return (
                    <Badge variant="default" className="bg-green-600">
                        Active
                    </Badge>
                );
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "My Listings",
                        description: "Manage your classified listings.",
                        url: "/my-classifieds",
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
                                <ShoppingBag className="size-8" />
                                My Listings
                            </h1>
                            <p className="mt-1 text-muted-foreground">Manage your classified listings</p>
                        </div>
                        <Button asChild>
                            <Link href={route("daynews.classifieds.create")}>
                                <Plus className="mr-2 size-4" />
                                Post New Listing
                            </Link>
                        </Button>
                    </div>

                    {/* Classifieds table */}
                    {classifieds.data.length > 0 ? (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Listing</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="text-center">Saves</TableHead>
                                            <TableHead className="text-center">Views</TableHead>
                                            <TableHead>Posted</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classifieds.data.map((classified) => (
                                            <TableRow key={classified.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                                                            {classified.primary_image ? (
                                                                <img
                                                                    src={classified.primary_image}
                                                                    alt={classified.title}
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex size-full items-center justify-center">
                                                                    <Package className="size-4 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={route("daynews.classifieds.show", {
                                                                    slug: classified.slug,
                                                                })}
                                                                className="font-medium hover:text-primary"
                                                            >
                                                                {classified.title}
                                                            </Link>
                                                            <p className="text-sm text-muted-foreground">
                                                                {classified.category.name}
                                                                {classified.condition_display &&
                                                                    ` • ${classified.condition_display}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(classified.status)}</TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{classified.price_display}</span>
                                                </TableCell>
                                                <TableCell className="text-center">{classified.saves_count}</TableCell>
                                                <TableCell className="text-center">{classified.view_count}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {dayjs(classified.created_at).fromNow()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link
                                                                href={route("daynews.classifieds.show", {
                                                                    slug: classified.slug,
                                                                })}
                                                            >
                                                                <Eye className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        {classified.can_edit && (
                                                            <>
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link
                                                                        href={route("daynews.classifieds.edit", {
                                                                            classified: classified.id,
                                                                        })}
                                                                    >
                                                                        <Edit className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                                {classified.status === "active" ? (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleMarkSold(classified.id)}
                                                                        title="Mark as Sold"
                                                                    >
                                                                        <CheckCircle className="size-4" />
                                                                    </Button>
                                                                ) : classified.status === "sold" ? (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleReactivate(classified.id)}
                                                                        title="Reactivate"
                                                                    >
                                                                        <Undo2 className="size-4" />
                                                                    </Button>
                                                                ) : null}
                                                            </>
                                                        )}
                                                        {classified.can_delete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(classified.id)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <div className="text-center">
                                <Package className="mx-auto mb-4 size-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-bold">No Listings Yet</h3>
                                <p className="mx-auto max-w-md text-muted-foreground">
                                    You haven't posted any listings yet. Start selling today!
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href={route("daynews.classifieds.create")}>
                                        <Plus className="mr-2 size-4" />
                                        Post Your First Listing
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

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
                </main>
            </div>
        </LocationProvider>
    );
}
