import axios from "axios";
import { GlobeIcon, ImageIcon, LockIcon, MapPinIcon, UsersIcon, X } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types";
import type { CreatePostForm, SocialPost } from "@/types/social";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPost: (post: SocialPost) => void;
    currentUser: User;
}

export function CreatePostModal({ isOpen, onClose, onPost, currentUser }: CreatePostModalProps) {
    const [formData, setFormData] = useState<CreatePostForm>({
        content: "",
        visibility: "public",
        media: undefined,
        location: undefined,
    });
    const [mediaPreview, setMediaPreview] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post(route("social.posts.create"), formData);
            if (response.data.post) {
                onPost(response.data.post);
                setFormData({
                    content: "",
                    visibility: "public",
                    media: undefined,
                    location: undefined,
                });
                setMediaPreview([]);
            }
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        // Filter to only image files
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length === 0) {
            alert("Please select only image files");
            return;
        }

        // Check if total would exceed 4 images
        const currentMediaCount = formData.media?.length || 0;
        if (currentMediaCount + imageFiles.length > 4) {
            alert("You can upload a maximum of 4 images");
            return;
        }

        try {
            const uploadPromises = imageFiles.map(async (file) => {
                const formData = new FormData();
                formData.append("image", file);

                const response = await axios.post(route("social.images.upload"), formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                return response.data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // Update form data with uploaded URLs (as strings, not files)
            setFormData((prev) => ({
                ...prev,
                media: [...(prev.media || []), ...uploadedUrls],
            }));

            // Update preview with the same URLs
            setMediaPreview((prev) => [...prev, ...uploadedUrls]);
        } catch (error) {
            console.error("Failed to upload images:", error);
            alert("Failed to upload images. Please try again.");
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            media: prev.media?.filter((_, i) => i !== index),
        }));
        setMediaPreview((prev) => prev.filter((_, i) => i !== index));
    };

    const visibilityOptions = [
        { value: "public", label: "Public", icon: GlobeIcon, description: "Anyone can see" },
        { value: "friends", label: "Friends", icon: UsersIcon, description: "Friends only" },
        { value: "private", label: "Only me", icon: LockIcon, description: "Only you can see" },
    ];

    const selectedVisibility = visibilityOptions.find((option) => option.value === formData.visibility);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* User info */}
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold">{currentUser.name}</div>
                            <Select
                                value={formData.visibility}
                                onValueChange={(value: "public" | "friends" | "private") => setFormData((prev) => ({ ...prev, visibility: value }))}
                            >
                                <SelectTrigger className="w-fit border-none p-0 h-auto shadow-none">
                                    <SelectValue>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            {selectedVisibility && <selectedVisibility.icon className="h-3 w-3 mr-1" />}
                                            {selectedVisibility?.label}
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {visibilityOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center">
                                                <option.icon className="h-4 w-4 mr-2" />
                                                <div>
                                                    <div className="font-medium">{option.label}</div>
                                                    <div className="text-xs text-muted-foreground">{option.description}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Content textarea */}
                    <Textarea
                        placeholder={`What's on your mind, ${currentUser.name.split(" ")[0]}?`}
                        value={formData.content}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                        className="min-h-[120px] border-none resize-none text-lg placeholder:text-lg focus-visible:ring-0"
                    />

                    {/* Media preview */}
                    {mediaPreview.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {mediaPreview.map((mediaUrl, index) => (
                                <div key={index} className="relative">
                                    <img src={mediaUrl} alt="" className="rounded-lg object-cover w-full h-32" />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Location */}
                    {formData.location && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{formData.location.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => setFormData((prev) => ({ ...prev, location: undefined }))}>
                                Remove
                            </Button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                <label htmlFor="media-upload" className="flex items-center cursor-pointer">
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Photo
                                </label>
                                <input id="media-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleMediaUpload} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => {
                                    // In a real app, you'd show a location picker
                                    setFormData((prev) => ({
                                        ...prev,
                                        location: { name: "Current Location", lat: 0, lng: 0 },
                                    }));
                                }}
                            >
                                <MapPinIcon className="h-4 w-4 mr-2" />
                                Location
                            </Button>
                        </div>

                        <Button onClick={handleSubmit} disabled={!formData.content.trim() || isSubmitting} className="min-w-[80px]">
                            {isSubmitting ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
