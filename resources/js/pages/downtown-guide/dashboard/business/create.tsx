import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, useForm } from "@inertiajs/react";
import { Auth } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BusinessCreateProps {
    auth: Auth;
}

export default function BusinessCreate({ auth }: BusinessCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        website: "",
        category: "",
        phone: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('downtown-guide.dashboard.business.store') as string);
    };

    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Create Business Profile",
                description: "List your business on the Downtown Guide",
            }}
        >
            <Head title="Create Business Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-xl font-semibold mb-6">Create Business Profile</h2>
                            <p className="mb-6 text-gray-600">
                                Enter your business details below to get listed in the Downtown Guide.
                            </p>

                            <form onSubmit={submit} className="space-y-6 max-w-2xl">
                                <div>
                                    <Label htmlFor="name">Business Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        required
                                        placeholder="e.g. Joe's Coffee"
                                    />
                                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData("description", e.target.value)}
                                        rows={4}
                                        placeholder="Tell us about your business..."
                                    />
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            value={data.category}
                                            onChange={(e) => setData("category", e.target.value)}
                                            required
                                            placeholder="e.g. Restaurant, Retail"
                                        />
                                        {errors.category && <div className="text-red-500 text-sm mt-1">{errors.category}</div>}
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData("phone", e.target.value)}
                                            placeholder="(555) 123-4567"
                                        />
                                        {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        required
                                        placeholder="123 Main St"
                                    />
                                    {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData("city", e.target.value)}
                                            required
                                        />
                                        {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}
                                    </div>
                                    <div className="col-span-1">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            value={data.state}
                                            onChange={(e) => setData("state", e.target.value)}
                                            required
                                        />
                                        {errors.state && <div className="text-red-500 text-sm mt-1">{errors.state}</div>}
                                    </div>
                                    <div className="col-span-1">
                                        <Label htmlFor="zip">ZIP Code</Label>
                                        <Input
                                            id="zip"
                                            value={data.zip}
                                            onChange={(e) => setData("zip", e.target.value)}
                                            required
                                        />
                                        {errors.zip && <div className="text-red-500 text-sm mt-1">{errors.zip}</div>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={data.website}
                                        onChange={(e) => setData("website", e.target.value)}
                                        placeholder="https://"
                                    />
                                    {errors.website && <div className="text-red-500 text-sm mt-1">{errors.website}</div>}
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        Create Business Profile
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
