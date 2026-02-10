import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon, GlobeIcon, LockIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";

export default function CreateGroup() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        privacy: "public",
        cover_image: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post("/social/groups", formData);
            if (response.status === 200 || response.status === 201) {
                toast.success("Group created successfully");
                router.visit("/social/groups");
            }
        } catch (error: any) {
            console.error("Error creating group:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to create group. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <AppLayout>
            <Head title="Create Group" />
            <div className="min-h-screen bg-background">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back button */}
                    <div className="mb-6">
                        <Link href="/social/groups">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Groups
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-display font-black tracking-tight text-foreground">Create New Group</h1>
                        <p className="text-muted-foreground mt-1">Start a community around your interests</p>
                    </div>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Group Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Group Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter group name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        required
                                        maxLength={100}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">{formData.name.length}/100 characters</p>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what your group is about"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        maxLength={1000}
                                        rows={4}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/1000 characters</p>
                                </div>

                                <div>
                                    <Label htmlFor="cover_image">Cover Image URL</Label>
                                    <Input
                                        id="cover_image"
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.cover_image}
                                        onChange={(e) => handleInputChange("cover_image", e.target.value)}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Optional: Add a cover image for your group</p>
                                </div>

                                <div>
                                    <Label>Privacy Setting</Label>
                                    <div className="mt-2 space-y-3">
                                        <div
                                            className={`cursor-pointer border rounded-lg p-4 transition-colors ${
                                                formData.privacy === "public" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                                            }`}
                                            onClick={() => handleInputChange("privacy", "public")}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="public"
                                                    name="privacy"
                                                    value="public"
                                                    checked={formData.privacy === "public"}
                                                    onChange={() => handleInputChange("privacy", "public")}
                                                    className="mr-3"
                                                />
                                                <div className="flex items-center flex-grow">
                                                    <GlobeIcon className="h-5 w-5 mr-3 text-primary" />
                                                    <div>
                                                        <p className="font-medium">Public</p>
                                                        <p className="text-sm text-muted-foreground">Anyone can see the group and join</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`cursor-pointer border rounded-lg p-4 transition-colors ${
                                                formData.privacy === "private" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                                            }`}
                                            onClick={() => handleInputChange("privacy", "private")}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="private"
                                                    name="privacy"
                                                    value="private"
                                                    checked={formData.privacy === "private"}
                                                    onChange={() => handleInputChange("privacy", "private")}
                                                    className="mr-3"
                                                />
                                                <div className="flex items-center flex-grow">
                                                    <LockIcon className="h-5 w-5 mr-3 text-primary" />
                                                    <div>
                                                        <p className="font-medium">Private</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Anyone can see the group, but only members can see posts
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`cursor-pointer border rounded-lg p-4 transition-colors ${
                                                formData.privacy === "secret" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                                            }`}
                                            onClick={() => handleInputChange("privacy", "secret")}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="secret"
                                                    name="privacy"
                                                    value="secret"
                                                    checked={formData.privacy === "secret"}
                                                    onChange={() => handleInputChange("privacy", "secret")}
                                                    className="mr-3"
                                                />
                                                <div className="flex items-center flex-grow">
                                                    <UserIcon className="h-5 w-5 mr-3 text-primary" />
                                                    <div>
                                                        <p className="font-medium">Secret</p>
                                                        <p className="text-sm text-muted-foreground">Only members can see the group exists</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Link href="/social/groups">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
                                        {isSubmitting ? "Creating..." : "Create Group"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
