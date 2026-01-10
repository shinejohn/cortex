import { Head, Link, useForm } from "@inertiajs/react";
import { AlertCircle, CheckCircle, Clock, ImagePlus, Loader2, Store as StoreIcon, XCircle } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Auth } from "@/types";

interface Store {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    status: "pending" | "approved" | "rejected" | "suspended";
    rejection_reason: string | null;
}

interface EditStoreProps {
    auth: Auth;
    store: Store;
}

export default function EditStore({ auth, store }: EditStoreProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(store.logo ? `/storage/${store.logo}` : null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(store.banner ? `/storage/${store.banner}` : null);

    const { data, setData, post, processing, errors } = useForm({
        name: store.name,
        description: store.description || "",
        logo: null as File | null,
        banner: null as File | null,
        _method: "PATCH",
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("logo", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("banner", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("stores.update", store.id));
    };

    const getStatusBadge = (status: Store["status"]) => {
        const variants: Record<
            Store["status"],
            { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }
        > = {
            pending: {
                variant: "secondary",
                icon: <Clock className="h-3 w-3 mr-1" />,
                label: "Pending Approval",
            },
            approved: {
                variant: "default",
                icon: <CheckCircle className="h-3 w-3 mr-1" />,
                label: "Approved",
            },
            rejected: {
                variant: "destructive",
                icon: <XCircle className="h-3 w-3 mr-1" />,
                label: "Rejected",
            },
            suspended: {
                variant: "outline",
                icon: <AlertCircle className="h-3 w-3 mr-1" />,
                label: "Suspended",
            },
        };

        const config = variants[status];
        return (
            <Badge variant={config.variant} className="flex items-center w-fit">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    return (
        <>
            <Head title={`Edit ${store.name}`} />

            <Header auth={auth} />

            {/* Page Header */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-4xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <StoreIcon className="h-8 w-8 text-primary" />
                                <h1 className="text-4xl font-bold text-foreground">Edit Store</h1>
                            </div>
                            <p className="text-lg text-muted-foreground mt-2">{store.name}</p>
                        </div>
                        <div>{getStatusBadge(store.status)}</div>
                    </div>

                    {/* Rejection Reason */}
                    {store.status === "rejected" && store.rejection_reason && (
                        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="flex items-start gap-2">
                                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                                <div>
                                    <p className="font-semibold text-destructive">Rejection Reason:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{store.rejection_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form */}
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-3 sm:px-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                                <CardDescription>Update your store information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Store Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="My Awesome Store"
                                        disabled={processing}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData("description", e.target.value)}
                                        placeholder="Tell customers about your store..."
                                        rows={4}
                                        disabled={processing}
                                        className={errors.description ? "border-destructive" : ""}
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Store Branding</CardTitle>
                                <CardDescription>Update your logo and banner image</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Logo */}
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onChange={handleLogoChange}
                                                disabled={processing}
                                                className={errors.logo ? "border-destructive" : ""}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Recommended: Square image, max 2MB. Formats: JPEG, PNG, GIF, WebP
                                            </p>
                                            {errors.logo && <p className="text-sm text-destructive mt-1">{errors.logo}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Banner */}
                                <div className="space-y-2">
                                    <Label htmlFor="banner">Banner</Label>
                                    <div className="space-y-3">
                                        <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                                            {bannerPreview ? (
                                                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">Banner preview</p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Input
                                                id="banner"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onChange={handleBannerChange}
                                                disabled={processing}
                                                className={errors.banner ? "border-destructive" : ""}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Recommended: Wide image (16:9 ratio), max 5MB. Formats: JPEG, PNG, GIF, WebP
                                            </p>
                                            {errors.banner && <p className="text-sm text-destructive mt-1">{errors.banner}</p>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex items-center justify-between">
                            <Link href={route("stores.my-stores")}>
                                <Button type="button" variant="outline" disabled={processing}>
                                    Back to My Stores
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}
