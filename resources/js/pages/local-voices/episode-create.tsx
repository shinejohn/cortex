import { SEO } from "@/components/common/seo";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Mic, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface Podcast {
    id: string;
    title: string;
    slug: string;
}

interface EpisodeCreatePageProps {
    auth?: Auth;
    podcast: Podcast;
    viewMode?: string;
}

export default function EpisodeCreate() {
    const { auth, podcast, viewMode } = usePage<EpisodeCreatePageProps>().props;
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);

    const form = useForm({
        title: "",
        description: "",
        show_notes: "",
        audio_file: null as File | null,
        episode_number: "",
    });

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("audio_file", file);
            setAudioPreview(file.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/podcasts/${podcast.slug}/episodes`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <GoLocalVoicesLayout auth={auth}>
            <Head title={`Upload Episode - ${podcast.title}`} />
            <SEO
                type="website"
                site="go-local-voices"
                data={{
                    title: `Upload Episode - ${podcast.title}`,
                    description: "Upload a new podcast episode",
                    url: `/podcasts/${podcast.slug}/episodes/create`,
                }}
            />

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit(`/podcasts/${podcast.slug}`)}
                            className="text-purple-600 hover:text-purple-700"
                        >
                            ← Back to {podcast.title}
                        </Button>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Upload Episode
                        </h1>
                        <p className="text-gray-600">Add a new episode to your podcast</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                        {/* Audio File */}
                        <div>
                            <Label>Audio File *</Label>
                            <div className="mt-2">
                                {audioPreview ? (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <Mic className="h-8 w-8 text-purple-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{audioPreview}</p>
                                                <p className="text-sm text-gray-600">MP3, WAV, or M4A • Max 100MB</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setAudioPreview(null);
                                                form.setData("audio_file", null);
                                                if (audioInputRef.current) {
                                                    audioInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => audioInputRef.current?.click()}
                                        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-purple-400 hover:bg-purple-50"
                                    >
                                        <Upload className="mb-2 h-12 w-12 text-gray-400" />
                                        <p className="text-sm text-gray-600">Click to upload audio file</p>
                                        <p className="mt-1 text-xs text-gray-500">MP3, WAV, or M4A • Max 100MB</p>
                                    </div>
                                )}
                                <input
                                    ref={audioInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                    className="hidden"
                                    required
                                />
                            </div>
                            {form.errors.audio_file && (
                                <p className="mt-1 text-sm text-red-600">{form.errors.audio_file}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Episode Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                            {form.errors.title && (
                                <p className="mt-1 text-sm text-red-600">{form.errors.title}</p>
                            )}
                        </div>

                        {/* Episode Number */}
                        <div>
                            <Label htmlFor="episode_number">Episode Number (Optional)</Label>
                            <Input
                                id="episode_number"
                                value={form.data.episode_number}
                                onChange={(e) => form.setData("episode_number", e.target.value)}
                                className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                placeholder="e.g., 001, S01E01"
                            />
                            {form.errors.episode_number && (
                                <p className="mt-1 text-sm text-red-600">{form.errors.episode_number}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData("description", e.target.value)}
                                className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                rows={4}
                                placeholder="Brief description of this episode..."
                            />
                            {form.errors.description && (
                                <p className="mt-1 text-sm text-red-600">{form.errors.description}</p>
                            )}
                        </div>

                        {/* Show Notes */}
                        <div>
                            <Label htmlFor="show_notes">Show Notes</Label>
                            <Textarea
                                id="show_notes"
                                value={form.data.show_notes}
                                onChange={(e) => form.setData("show_notes", e.target.value)}
                                className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                rows={8}
                                placeholder="Detailed show notes, links, timestamps, etc..."
                            />
                            {form.errors.show_notes && (
                                <p className="mt-1 text-sm text-red-600">{form.errors.show_notes}</p>
                            )}
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="mb-2 font-semibold text-red-800">Please fix the following errors:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                    {Object.entries(form.errors).map(([field, error]) => (
                                        <li key={field}>
                                            <strong>{field}:</strong> {error as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-4">
                            <Button 
                                type="submit" 
                                disabled={form.processing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <Mic className={`mr-2 h-4 w-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Uploading..." : "Upload Episode"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/podcasts/${podcast.slug}`)}
                                disabled={form.processing}
                                className="border-gray-300"
                            >
                                Cancel
                            </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                            The episode will be saved as a draft. You can publish it from the podcast page.
                        </p>
                    </form>
                </div>
            </div>
        </GoLocalVoicesLayout>
    );
}

