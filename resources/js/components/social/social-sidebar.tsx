import { Link, router } from "@inertiajs/react";
import axios from "axios";
import { CalendarIcon, LinkIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { route } from "ziggy-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SocialUserProfile, User, UserWithSocial } from "@/types/social";

interface SocialSidebarProps {
    currentUser: User;
    userProfile?: SocialUserProfile;
    suggestedFriends: UserWithSocial[];
}

export function SocialSidebar({ currentUser, userProfile, suggestedFriends }: SocialSidebarProps) {
    const handleSendFriendRequest = async (userId: number) => {
        try {
            await axios.post(route("social.friend.request", userId));
            toast.success("Friend request sent successfully");
            router.reload({ only: ["suggestedFriends"] });
        } catch (error: any) {
            console.error("Error sending friend request:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to send friend request. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">{currentUser.name}</h3>
                            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {userProfile?.bio && <p className="text-sm text-muted-foreground mb-3">{userProfile.bio}</p>}

                    <div className="space-y-2 text-sm">
                        {userProfile?.location && (
                            <div className="flex items-center text-muted-foreground">
                                <MapPinIcon className="h-4 w-4 mr-2" />
                                {userProfile.location}
                            </div>
                        )}

                        {userProfile?.website && (
                            <div className="flex items-center text-muted-foreground">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {userProfile.website}
                                </a>
                            </div>
                        )}

                        <div className="flex items-center text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Joined{" "}
                            {new Date(currentUser.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <Link href={route("social.profile", currentUser.id)}>
                        <Button variant="outline" size="sm" className="w-full">
                            View Profile
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Your Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-primary">{currentUser.friends_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Friends</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">{currentUser.posts_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Posts</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">{currentUser.following_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Following</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">{currentUser.followers_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Suggested Friends */}
            {suggestedFriends && suggestedFriends.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">
                            <UsersIcon className="h-4 w-4 mr-2" />
                            People You May Know
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {suggestedFriends.slice(0, 3).map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={friend.avatar} alt={friend.name} />
                                            <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{friend.name}</div>
                                            {friend.social_profile?.location && (
                                                <div className="text-xs text-muted-foreground">{friend.social_profile.location}</div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSendFriendRequest(friend.id)}
                                        disabled={friend.has_pending_friend_request}
                                    >
                                        {friend.has_pending_friend_request ? "Pending" : "Add"}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {suggestedFriends.length > 3 && (
                            <Link href={route("social.friends.index")}>
                                <Button variant="ghost" size="sm" className="w-full mt-4">
                                    See All Suggestions
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Link href={route("social.groups.index")}>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                <UsersIcon className="h-4 w-4 mr-2" />
                                Browse Groups
                            </Button>
                        </Link>
                        <Link href={route("social.friends.index")}>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                <UsersIcon className="h-4 w-4 mr-2" />
                                Find Friends
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
