import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Auth } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import { ImagePlus, Loader2, Store as StoreIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface CreateStoreProps {
    auth: Auth;
}

export default function CreateStore({ auth }: CreateStoreProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        logo: null as File | null,
        banner: null as File | null,
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
        post(route("stores.store"));
    };

    return (
        <>
            <Head title="Create Store" />

            <Header auth={auth} />

            {/* Page Header */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-4xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                        <StoreIcon className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold text-foreground">Create Store</h1>
                    </div>
                    <p className="text-lg text-muted-foreground mt-2">Set up your store to start selling products</p>
                </div>
            </div>

            {/* Form */}
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-3 sm:px-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                                <CardDescription>Provide basic information about your store</CardDescription>
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
                                <CardDescription>Upload your logo and banner image</CardDescription>
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
                        <div className="flex items-center justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Store
                            </Button>
                        </div>
                    </form>

                    {/* Info Card */}
                    <Card className="mt-6 bg-muted/50">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">What happens next?</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">1.</span>
                                    <span>Your store will be submitted for approval</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">2.</span>
                                    <span>Once approved, you'll need to complete Stripe Connect onboarding to accept payments</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">3.</span>
                                    <span>After Stripe setup, you can start adding products and receiving orders</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Footer />
        </>
    );
}
