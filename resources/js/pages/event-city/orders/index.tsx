import { Head, Link, router } from "@inertiajs/react";
import { Filter, Package, ShoppingBag } from "lucide-react";
import { route } from "ziggy-js";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Auth } from "@/types";

interface Order {
    id: string;
    order_number: string;
    customer_email: string;
    customer_name: string;
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    payment_status: "pending" | "paid" | "failed" | "refunded";
    created_at: string;
    store: {
        id: string;
        name: string;
        slug: string;
    };
    items_count: number;
}

interface PaginatedOrders {
    data: Order[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface OrdersIndexProps {
    auth: Auth;
    orders: PaginatedOrders;
    filters: {
        status?: string;
        payment_status?: string;
    };
}

export default function OrdersIndex({ auth, orders, filters }: OrdersIndexProps) {
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: Order["status"]) => {
        const variants: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
            pending: "secondary",
            processing: "default",
            shipped: "default",
            delivered: "outline",
            cancelled: "destructive",
        };

        return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const getPaymentStatusBadge = (status: Order["payment_status"]) => {
        const variants: Record<Order["payment_status"], "default" | "secondary" | "destructive" | "outline"> = {
            pending: "secondary",
            paid: "default",
            failed: "destructive",
            refunded: "outline",
        };

        return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const handleFilter = (filterType: "status" | "payment_status", value: string) => {
        router.get(
            route("orders.index"),
            { ...filters, [filterType]: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        router.get(route("orders.index"), {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Orders" />

            <Header auth={auth} />

            {/* Page Header */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold text-foreground">Orders</h1>
                    </div>
                    <p className="text-lg text-muted-foreground mt-2">Manage your store orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="py-6 border-b bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Order Status
                                        {filters.status && `: ${filters.status}`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleFilter("status", "pending")}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilter("status", "processing")}>Processing</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilter("status", "shipped")}>Shipped</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilter("status", "delivered")}>Delivered</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilter("status", "cancelled")}>Cancelled</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Payment Status
                                        {filters.payment_status && `: ${filters.payment_status}`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Filter by Payment</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleFilter("payment_status", "pending")}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilter("payment_status", "paid")}>Paid</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilter("payment_status", "failed")}>Failed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilter("payment_status", "refunded")}>Refunded</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {(filters.status || filters.payment_status) && (
                                <Button variant="ghost" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {orders.total} {orders.total === 1 ? "order" : "orders"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    {orders.data.length > 0 ? (
                        <>
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Store</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Payment</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.data.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">{order.order_number}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{order.customer_name}</p>
                                                            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={route("stores.show", order.store.slug)} className="hover:underline text-primary">
                                                            {order.store.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{order.items_count}</TableCell>
                                                    <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={route("orders.show", order.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Pagination */}
                            {orders.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {orders.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url);
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                            <p className="text-muted-foreground mb-6">
                                {filters.status || filters.payment_status ? "Try adjusting your filters" : "Orders will appear here"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
