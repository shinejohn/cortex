import { Head, useForm, usePage } from "@inertiajs/react";
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateCommunityThreadPageProps, THREAD_TYPES, ThreadType } from "@/types/community";

export default function CreateThread() {
    const { auth, community } = usePage<CreateCommunityThreadPageProps>().props;
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        title: "",
        content: "",
        type: "" as ThreadType,
        tags: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/community/${community.id}/threads`, {
            onSuccess: () => {
                // Will redirect to community page on success
            },
        });
    };

    const addTag = (tag: string): void => {
        if (tag && !selectedTags.includes(tag) && selectedTags.length < 10) {
            const newTags = [...selectedTags, tag];
            setSelectedTags(newTags);
            setData("tags", newTags);
        }
        setCustomTag("");
    };

    const removeTag = (tagToRemove: string): void => {
        const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
        setSelectedTags(newTags);
        setData("tags", newTags);
    };

    const handleTagKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(customTag.trim());
        }
    };

    return (
        <>
            <Head title={`Create Thread - ${community.name}`} />
            <Header auth={auth} />

            <div className="min-h-screen bg-background py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="flex items-center text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-1" />
                            Back to {community.name}
                        </Button>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Start a New Thread</h1>
                        <p className="mt-2 text-muted-foreground">
                            Share your thoughts, ask questions, or start a discussion in the <span className="font-medium">{community.name}</span>{" "}
                            community.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-card rounded-lg border p-6 space-y-6">
                            {/* Thread Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Thread Type</Label>
                                <Select value={data.type} onValueChange={(value) => setData("type", value as ThreadType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a thread type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {community.threadTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter a clear, descriptive title for your thread"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    className={errors.title ? "border-destructive" : ""}
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Share your thoughts, provide details, or ask your question..."
                                    value={data.content}
                                    onChange={(e) => setData("content", e.target.value)}
                                    rows={10}
                                    className={errors.content ? "border-destructive" : ""}
                                />
                                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="space-y-3">
                                    {/* Popular Tags */}
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Popular tags in this community:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {community.popularTags.map((tag) => (
                                                <Button
                                                    key={tag}
                                                    type="button"
                                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => (selectedTags.includes(tag) ? removeTag(tag) : addTag(tag))}
                                                    className="text-xs"
                                                >
                                                    {tag}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Tag Input */}
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Or add your own tags:</p>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add a custom tag"
                                                value={customTag}
                                                onChange={(e) => setCustomTag(e.target.value)}
                                                onKeyPress={handleTagKeyPress}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => addTag(customTag.trim())}
                                                disabled={!customTag.trim() || selectedTags.length >= 10}
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Selected Tags */}
                                    {selectedTags.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Selected tags ({selectedTags.length}/10):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                                        {tag}
                                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                                                            <XIcon className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errors.tags && <p className="text-sm text-destructive">{errors.tags}</p>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                            <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Creating..." : "Create Thread"}
                            </Button>
                        </div>
                    </form>

                    {/* Guidelines */}
                    <div className="mt-8 bg-muted/50 rounded-lg p-6">
                        <h3 className="font-medium mb-3">Community Guidelines</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Be respectful and constructive in your discussions</li>
                            <li>• Stay on topic and use appropriate tags</li>
                            <li>• Search existing threads before creating new ones</li>
                            <li>• Provide clear, detailed descriptions for questions</li>
                            <li>• Follow community-specific rules and guidelines</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
