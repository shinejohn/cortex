import { Head } from "@inertiajs/react";
import axios from "axios";
import { LockIcon, UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";

interface User {
    id: string;
    name: string;
    username?: string;
    avatar: string;
}

interface Props {
    profile_user: User;
}

export default function ProfilePrivate({ profile_user }: Props) {
    const handleSendFriendRequest = async () => {
        try {
            await axios.post(`/social/users/${profile_user.id}/friend-request`);
            // Optionally show success message or update UI
            alert("Friend request sent!");
        } catch (error) {
            console.error("Failed to send friend request:", error);
            alert("Failed to send friend request. Please try again.");
        }
    };

    return (
        <AppLayout>
            <Head title={`${profile_user.name} - Profile`} />
            <div className="min-h-screen bg-muted/50">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                    <div className="group bg-card overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow rounded-lg p-8 text-center">
                        {/* Profile photo */}
                        <div className="relative inline-block mb-6">
                            <img src={profile_user.avatar} alt={profile_user.name} className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-background shadow-md" />
                            <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-2 shadow-sm">
                                <LockIcon className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        {/* Profile info */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-display font-black tracking-tight text-foreground mb-1">{profile_user.name}</h1>
                            {profile_user.username && <p className="text-muted-foreground">@{profile_user.username}</p>}
                        </div>

                        {/* Private profile message */}
                        <div className="mb-8">
                            <div className="bg-muted/50 rounded-lg p-6 mb-4">
                                <LockIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                <h2 className="text-lg font-semibold text-foreground mb-2">This Profile is Private</h2>
                                <p className="text-muted-foreground">
                                    You need to be friends with {profile_user.name} to see their profile content. Send a friend request to connect
                                    with them.
                                </p>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-center gap-3">
                            <Button onClick={handleSendFriendRequest}>
                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                Send Friend Request
                            </Button>
                            <Button variant="outline" onClick={() => window.history.back()}>
                                Go Back
                            </Button>
                        </div>

                        {/* Additional info */}
                        <div className="mt-8 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">Once {profile_user.name} accepts your friend request, you'll be able to:</p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                <li>See their posts and photos</li>
                                <li>Send them messages</li>
                                <li>View their activity</li>
                                <li>See mutual friends</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
