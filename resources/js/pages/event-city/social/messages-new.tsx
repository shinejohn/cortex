import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon, MessageCircleIcon, SearchIcon, UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";

interface Friend {
    id: string;
    name: string;
    username?: string;
    email: string;
    avatar: string;
}

interface Props {
    friends: Friend[];
}

export default function MessagesNew({ friends }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    const handleFriendToggle = (friendId: string) => {
        setSelectedFriends((prev) => (prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]));
    };

    const handleStartConversation = async () => {
        if (selectedFriends.length === 0) return;

        if (selectedFriends.length === 1) {
            // Direct message
            router.visit(`/social/messages/user-${selectedFriends[0]}`);
        } else {
            // Group conversation
            try {
                await axios.post("/social/messages", {
                    participants: selectedFriends,
                    type: "group",
                });
                router.visit("/social/messages");
            } catch (error) {
                console.error("Failed to create conversation:", error);
            }
        }
    };

    const filteredFriends = friends.filter(
        (friend) =>
            friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (friend.username && friend.username.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    return (
        <AppLayout>
            <Head title="New Message" />
            <div className="min-h-screen bg-muted/50">
                <div className="max-w-2xl mx-auto py-8">
                    <div className="bg-card rounded-lg shadow">
                        {/* Header */}
                        <div className="p-4 border-b border flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href="/social/messages"
                                    className="mr-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </Link>
                                <h1 className="text-xl font-bold text-foreground">New Message</h1>
                            </div>
                            {selectedFriends.length > 0 && (
                                <Button onClick={handleStartConversation}>
                                    Start Chat
                                    {selectedFriends.length > 1 && ` (${selectedFriends.length})`}
                                </Button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search friends..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {selectedFriends.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {selectedFriends.length === 1 ? "1 friend selected" : `${selectedFriends.length} friends selected`}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFriends.map((friendId) => {
                                            const friend = friends.find((f) => f.id === friendId);
                                            if (!friend) return null;
                                            return (
                                                <span
                                                    key={friendId}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                                                >
                                                    <img src={friend.avatar} alt={friend.name} className="w-4 h-4 rounded-full mr-2" />
                                                    {friend.name}
                                                    <button
                                                        onClick={() => handleFriendToggle(friendId)}
                                                        className="ml-2 text-primary hover:text-primary/80"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Friends list */}
                        <div className="max-h-96 overflow-y-auto">
                            {filteredFriends.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {filteredFriends.map((friend) => (
                                        <button
                                            key={friend.id}
                                            onClick={() => handleFriendToggle(friend.id)}
                                            className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                                                selectedFriends.includes(friend.id) ? "bg-primary/10" : ""
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <img src={friend.avatar} alt={friend.name} className="h-12 w-12 rounded-full object-cover" />
                                                <div className="ml-4 flex-1">
                                                    <h3 className="text-sm font-medium text-foreground">{friend.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {friend.username ? `@${friend.username}` : friend.email}
                                                    </p>
                                                </div>
                                                {selectedFriends.includes(friend.id) && (
                                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery ? (
                                <div className="p-8 text-center">
                                    <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No friends found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search to find the friend you're looking for.</p>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <MessageCircleIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No friends to message</h3>
                                    <p className="text-muted-foreground mb-4">You need to add friends before you can start messaging them.</p>
                                    <Link href="/social/friends">
                                        <Button>
                                            <UserPlusIcon className="h-5 w-5 mr-2" />
                                            Find Friends
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        {filteredFriends.length > 0 && (
                            <div className="p-4 bg-muted/50 border-t border">
                                <p className="text-sm text-muted-foreground text-center">
                                    Select one friend for a direct message, or multiple friends to start a group chat.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
