import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, Link } from "@inertiajs/react";
import { Auth } from "@/types";
import { format } from "date-fns";
import { ExternalLink, Mic, Video, FileText } from "lucide-react";

interface LocalVoice {
    id: string;
    title: string;
    description: string;
    author: string;
    url: string; // If external link
    type: string; // audio, video, article
    duration: string;
    image_url: string;
    published_at: string;
    business: {
        id: string;
        name: string;
        slug: string;
    }
}

interface CommunityIndexProps {
    auth: Auth;
    stories: LocalVoice[];
}

export default function CommunityIndex({ auth, stories }: CommunityIndexProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'audio': return <Mic className="h-4 w-4" />;
            case 'video': return <Video className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Community & Stories",
                description: "Local voices and stories from downtown",
            }}
        >
            <Head title="Community" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900">Community Voices</h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Discover stories, podcasts, and videos from the people who make our downtown unique.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stories.length > 0 ? (
                            stories.map((story) => (
                                <div key={story.id} className="bg-white rounded-lg shadowoverflow-hidden border group hover:shadow-md transition-shadow">
                                    {story.image_url ? (
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img src={story.image_url} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-400">{getIcon(story.type)}</span>
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center space-x-2 text-xs text-indigo-600 font-medium mb-3 uppercase tracking-wide">
                                            {getIcon(story.type)}
                                            <span>{story.type}</span>
                                            {story.duration && <span className="text-gray-400">• {story.duration}</span>}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            <Link href={route('downtown-guide.community.show', story.id)}>
                                                {story.title}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-600 line-clamp-3 mb-4">
                                            {story.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span>{story.author}</span>
                                                <span className="mx-1">•</span>
                                                <span>{format(new Date(story.published_at), 'MMM d, yyyy')}</span>
                                            </div>
                                            {story.business && (
                                                <Link
                                                    href={route('downtown-guide.businesses.show', story.business.slug)}
                                                    className="text-xs font-medium text-gray-500 hover:text-indigo-600 bg-gray-50 px-2 py-1 rounded"
                                                >
                                                    @{story.business.name}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No stories available at the moment. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
