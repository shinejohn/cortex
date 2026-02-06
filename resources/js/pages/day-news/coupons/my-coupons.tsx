import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { MyCouponsPageProps } from "@/types/coupon";
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import { ArrowLeft, BadgeCheck, Edit, Eye, Plus, Star, Ticket, Trash2 } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends MyCouponsPageProps {
    auth?: Auth;
}

export default function MyCoupons({ auth, coupons }: Props) {
    const handleDelete = (couponId: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        router.delete(route("daynews.coupons.destroy", { coupon: couponId }));
    };

    const getStatusBadge = (status: string, isVerified: boolean) => {
        if (status === "expired") {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (status === "removed") {
            return <Badge variant="secondary">Removed</Badge>;
        }
        if (isVerified) {
            return (
                <Badge variant="default" className="gap-1 bg-green-600">
                    <BadgeCheck className="size-3" />
                    Verified
                </Badge>
            );
        }
        return <Badge variant="outline">Active</Badge>;
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "My Coupons",
                        description: "Manage your submitted coupons.",
                        url: "/my-coupons",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("daynews.coupons.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Coupons
                            </Link>
                        </Button>
                    </div>

                    {/* Page header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
                                <Ticket className="size-8" />
                                My Coupons
                            </h1>
                            <p className="mt-1 text-muted-foreground">Manage coupons you've submitted</p>
                        </div>
                        <Button asChild>
                            <Link href={route("daynews.coupons.create")}>
                                <Plus className="mr-2 size-4" />
                                Submit New Coupon
                            </Link>
                        </Button>
                    </div>

                    {/* Coupons table */}
                    {coupons.data.length > 0 ? (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Coupon</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Score</TableHead>
                                            <TableHead className="text-center">Saves</TableHead>
                                            <TableHead className="text-center">Views</TableHead>
                                            <TableHead>Expires</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coupons.data.map((coupon) => (
                                            <TableRow key={coupon.id}>
                                                <TableCell>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={route("daynews.coupons.show", { slug: coupon.slug })}
                                                            className="font-medium hover:text-primary"
                                                        >
                                                            {coupon.title}
                                                        </Link>
                                                        <p className="text-sm text-muted-foreground">{coupon.business.name}</p>
                                                        <Badge variant="secondary" className="mt-1">
                                                            {coupon.discount_display}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(coupon.status, coupon.is_verified)}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Star className="size-4 text-yellow-500" />
                                                        {coupon.score}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">{coupon.saves_count}</TableCell>
                                                <TableCell className="text-center">{coupon.view_count}</TableCell>
                                                <TableCell>
                                                    {coupon.valid_until ? dayjs(coupon.valid_until).format("MMM D, YYYY") : "No expiry"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={route("daynews.coupons.show", { slug: coupon.slug })}>
                                                                <Eye className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        {coupon.can_edit && (
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link href={route("daynews.coupons.edit", { coupon: coupon.id })}>
                                                                    <Edit className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {coupon.can_delete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(coupon.id)}
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
                                <Ticket className="mx-auto mb-4 size-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-bold">No Coupons Yet</h3>
                                <p className="mx-auto max-w-md text-muted-foreground">
                                    You haven't submitted any coupons yet. Share a deal with your community!
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href={route("daynews.coupons.create")}>
                                        <Plus className="mr-2 size-4" />
                                        Submit Your First Coupon
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {coupons.last_page > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            {coupons.prev_page_url && (
                                <Button variant="outline" asChild>
                                    <Link href={coupons.prev_page_url}>Previous</Link>
                                </Button>
                            )}
                            <span className="px-4 text-sm text-muted-foreground">
                                Page {coupons.current_page} of {coupons.last_page}
                            </span>
                            {coupons.next_page_url && (
                                <Button variant="outline" asChild>
                                    <Link href={coupons.next_page_url}>Next</Link>
                                </Button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </LocationProvider>
    );
}
