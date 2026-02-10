import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { ClockIcon, FilterIcon, MessageCircleIcon, SearchIcon, UsersIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";

interface Friend {
    id: string;
    name: string;
    username: string;
    avatar: string;
    location?: string;
    status: "friend" | "pending_sent";
}

interface Props {
    friends: Friend[];
    sentRequests: Friend[];
}

export default function FriendsIndex({ friends, sentRequests }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [requests, setRequests] = useState(sentRequests);
    const [isLoading, setIsLoading] = useState(false);

    const filteredFriends = friends.filter(
        (friend) =>
            friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const filteredRequests = requests.filter(
        (request) =>
            request.name.toLowerCase().includes(searchQuery.toLowerCase()) || request.username.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleCancelRequest = async (friendId: string) => {
        if (!confirm("Are you sure you want to cancel this friend request?")) {
            return;
        }

        setIsLoading(true);
        try {
            console.log("Cancelling friend request for user ID:", friendId);
            const response = await axios.delete(route("social.friends.cancel", friendId));
            console.log("Cancel response:", response.data);
            setRequests((prev) => prev.filter((request) => request.id !== friendId));
        } catch (error: any) {
            console.error("Error cancelling friend request:", error);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);

                if (error.response.status === 404) {
                    alert("Friend request not found. It may have already been cancelled or accepted.");
                    // Remove from UI since it doesn't exist on server
                    setRequests((prev) => prev.filter((request) => request.id !== friendId));
                } else {
                    alert("Failed to cancel friend request. Please try again.");
                }
            } else {
                alert("Network error. Please check your connection and try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Friends" />
            <div className="min-h-screen bg-muted/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-display font-black tracking-tight text-foreground">Friends</h1>
                        <p className="text-muted-foreground">
                            Your friends on the platform ({friends.length} friends{requests.length > 0 ? `, ${requests.length} pending requests` : ""}
                            )
                        </p>
                    </div>

                    {/* Search and filter */}
                    <div className="bg-card rounded-lg shadow-sm mb-6 p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search friends by name or username"
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <FilterIcon className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sent requests section */}
                    {filteredRequests.length > 0 && (
                        <div className="bg-card rounded-lg shadow-sm mb-6">
                            <div className="p-4 border-b">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="h-5 w-5 text-amber-500" />
                                    <h2 className="text-lg font-medium text-foreground">Pending Friend Requests ({filteredRequests.length})</h2>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Friend requests you've sent that are waiting for a response</p>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredRequests.map((request) => (
                                    <div key={request.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50/50 dark:bg-amber-950/20">
                                        <div className="flex items-center">
                                            <img src={request.avatar} alt={request.name} className="h-16 w-16 rounded-full object-cover" />
                                            <div className="ml-4 flex-1 min-w-0">
                                                <h3 className="font-medium text-foreground truncate">{request.name}</h3>
                                                <p className="text-sm text-muted-foreground truncate">@{request.username}</p>
                                                {request.location && <p className="text-xs text-muted-foreground truncate">{request.location}</p>}
                                                <div className="flex items-center gap-1 mt-1">
                                                    <ClockIcon className="h-3 w-3 text-amber-500" />
                                                    <span className="text-xs text-amber-600 font-medium">Pending</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex gap-2">
                                            <Link href={`/social/profile/${request.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    View Profile
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleCancelRequest(request.id)}
                                                disabled={isLoading}
                                            >
                                                <XIcon className="h-4 w-4 mr-1" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Friends grid */}
                    <div className="bg-card rounded-lg shadow-sm">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-medium text-foreground">All Friends ({filteredFriends.length})</h2>
                        </div>

                        {filteredFriends.length > 0 ? (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFriends.map((friend) => (
                                    <div key={friend.id} className="group border overflow-hidden rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center">
                                            <img src={friend.avatar} alt={friend.name} className="h-16 w-16 rounded-full object-cover" />
                                            <div className="ml-4 flex-1 min-w-0">
                                                <h3 className="font-medium text-foreground truncate">{friend.name}</h3>
                                                <p className="text-sm text-muted-foreground truncate">@{friend.username}</p>
                                                {friend.location && <p className="text-xs text-muted-foreground truncate">{friend.location}</p>}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex gap-2">
                                            <Link href={`/social/profile/${friend.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    View Profile
                                                </Button>
                                            </Link>
                                            <Link href={`/social/messages/${friend.id}`} className="flex-1">
                                                <Button size="sm" className="w-full">
                                                    <MessageCircleIcon className="h-4 w-4 mr-1" />
                                                    Message
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchQuery ? (
                            <div className="p-8 text-center">
                                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                <h3 className="text-lg font-medium text-foreground mb-2">No friends found</h3>
                                <p className="text-muted-foreground">No friends match your search query "{searchQuery}".</p>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                <h3 className="text-lg font-medium text-foreground mb-2">No friends yet</h3>
                                <p className="text-muted-foreground mb-4">Start connecting with people to build your network.</p>
                                <Link href="/social">
                                    <Button>Explore Social Feed</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
