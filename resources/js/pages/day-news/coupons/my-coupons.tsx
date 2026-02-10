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
            return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Removed</Badge>;
        }
        if (isVerified) {
            return (
                <Badge variant="default" className="gap-1 bg-green-600">
                    <BadgeCheck className="size-3" />
                    Verified
                </Badge>
            );
        }
        return <Badge variant="outline" className="border-indigo-300 text-indigo-600">Active</Badge>;
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
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

                <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                            <Link href={route("daynews.coupons.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Coupons
                            </Link>
                        </Button>
                    </div>

                    {/* Page header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-3 font-display text-3xl font-black tracking-tight text-gray-900">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100">
                                    <Ticket className="size-6 text-indigo-600" />
                                </div>
                                My Coupons
                            </h1>
                            <p className="mt-2 text-gray-600">Manage coupons you've submitted</p>
                        </div>
                        <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
                            <Link href={route("daynews.coupons.create")}>
                                <Plus className="mr-2 size-4" />
                                Submit New Coupon
                            </Link>
                        </Button>
                    </div>

                    {/* Coupons table */}
                    {coupons.data.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Coupon</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Score</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Saves</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Views</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Expires</TableHead>
                                            <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coupons.data.map((coupon) => (
                                            <TableRow key={coupon.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={route("daynews.coupons.show", { slug: coupon.slug })}
                                                            className="font-medium text-gray-900 hover:text-indigo-600"
                                                        >
                                                            {coupon.title}
                                                        </Link>
                                                        <p className="text-sm text-gray-500">{coupon.business.name}</p>
                                                        <span className="mt-1 inline-block rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                                                            {coupon.discount_display}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(coupon.status, coupon.is_verified)}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Star className="size-4 text-yellow-500" />
                                                        {coupon.score}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center text-gray-600">{coupon.saves_count}</TableCell>
                                                <TableCell className="text-center text-gray-600">{coupon.view_count}</TableCell>
                                                <TableCell className="text-gray-600">
                                                    {coupon.valid_until ? dayjs(coupon.valid_until).format("MMM D, YYYY") : "No expiry"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" asChild className="text-gray-500 hover:text-indigo-600">
                                                            <Link href={route("daynews.coupons.show", { slug: coupon.slug })}>
                                                                <Eye className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        {coupon.can_edit && (
                                                            <Button variant="ghost" size="icon" asChild className="text-gray-500 hover:text-indigo-600">
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
                        </div>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                                    <Ticket className="size-8 text-gray-400" />
                                </div>
                                <h3 className="mb-2 font-display text-xl font-bold tracking-tight text-gray-900">No Coupons Yet</h3>
                                <p className="mx-auto max-w-md text-gray-600">
                                    You haven't submitted any coupons yet. Share a deal with your community!
                                </p>
                                <Button className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700" asChild>
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
                                <Button variant="outline" asChild className="border-gray-300">
                                    <Link href={coupons.prev_page_url}>Previous</Link>
                                </Button>
                            )}
                            <span className="px-4 text-sm text-gray-500">
                                Page {coupons.current_page} of {coupons.last_page}
                            </span>
                            {coupons.next_page_url && (
                                <Button variant="outline" asChild className="border-gray-300">
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
