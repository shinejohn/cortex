import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon, GlobeIcon, LockIcon, MessageSquareIcon, PlusIcon, SettingsIcon, UserIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";

interface GroupMember {
    id: string;
    user_id: string;
    role: "admin" | "moderator" | "member";
    status: "pending" | "approved" | "banned";
    joined_at: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
}

interface Group {
    id: string;
    name: string;
    description: string;
    cover_image?: string;
    privacy: "public" | "private" | "secret";
    creator_id: string;
    is_active: boolean;
    created_at: string;
    members_count: number;
    user_membership?: GroupMember;
    creator: {
        id: string;
        name: string;
        avatar?: string;
    };
    members: GroupMember[];
}

interface Props {
    group: Group;
}

export default function ShowGroup({ group }: Props) {
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const handleJoinGroup = async () => {
        setIsJoining(true);
        try {
            await axios.post(`/social/groups/${group.id}/join`);
            toast.success("Successfully joined group");
            router.reload({ only: ["group"] });
        } catch (error) {
            console.error("Error joining group:", error);
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (confirm("Are you sure you want to leave this group?")) {
            setIsLeaving(true);
            try {
                await axios.delete(`/social/groups/${group.id}/leave`);
                toast.success("Successfully left group");
                router.reload({ only: ["group"] });
            } catch (error) {
                console.error("Error leaving group:", error);
            } finally {
                setIsLeaving(false);
            }
        }
    };

    const canManage = group.user_membership?.role === "admin" || group.user_membership?.role === "moderator";
    const isMember = group.user_membership?.status === "approved";
    const isPending = group.user_membership?.status === "pending";

    const getPrivacyIcon = () => {
        switch (group.privacy) {
            case "private":
                return <LockIcon className="h-4 w-4" />;
            case "secret":
                return <UserIcon className="h-4 w-4" />;
            default:
                return <GlobeIcon className="h-4 w-4" />;
        }
    };

    const getPrivacyText = () => {
        switch (group.privacy) {
            case "private":
                return "Private Group";
            case "secret":
                return "Secret Group";
            default:
                return "Public Group";
        }
    };

    return (
        <AppLayout>
            <Head title={group.name} />
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back button */}
                    <div className="mb-6">
                        <Link href="/social/groups">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Groups
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main content */}
                        <div className="lg:w-2/3">
                            {/* Group header */}
                            <Card className="mb-6">
                                <div className="relative">
                                    {group.cover_image && (
                                        <div className="h-48 sm:h-64">
                                            <img src={group.cover_image} alt={group.name} className="w-full h-full object-cover rounded-t-lg" />
                                        </div>
                                    )}
                                    <CardContent className={`p-6 ${!group.cover_image ? "pt-8" : ""}`}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div className="flex-grow">
                                                <h1 className="text-3xl font-bold text-foreground mb-2">{group.name}</h1>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        {getPrivacyIcon()}
                                                        {getPrivacyText()}
                                                    </Badge>
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <UsersIcon className="h-4 w-4" />
                                                        {group.members_count.toLocaleString()} members
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground">{group.description}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {!isMember && !isPending && (
                                                    <Button onClick={handleJoinGroup} disabled={isJoining}>
                                                        {isJoining ? "Joining..." : "Join Group"}
                                                    </Button>
                                                )}
                                                {isPending && (
                                                    <Button variant="outline" disabled>
                                                        Request Pending
                                                    </Button>
                                                )}
                                                {isMember && (
                                                    <>
                                                        <Link href={`/social/groups/${group.id}/posts`}>
                                                            <Button variant="outline">
                                                                <MessageSquareIcon className="h-4 w-4 mr-2" />
                                                                View Posts
                                                            </Button>
                                                        </Link>
                                                        {canManage && (
                                                            <Button variant="outline" size="icon">
                                                                <UserPlusIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" onClick={handleLeaveGroup} disabled={isLeaving}>
                                                            {isLeaving ? "Leaving..." : "Leave"}
                                                        </Button>
                                                    </>
                                                )}
                                                {canManage && (
                                                    <Button variant="outline" size="icon">
                                                        <SettingsIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>

                            {/* Quick post section for members */}
                            {isMember && (
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Share with the group</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={`/social/groups/${group.id}/posts`}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                Create a new post...
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">No recent activity to display.</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/3">
                            {/* Group info */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">About</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Created by</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={group.creator.avatar} />
                                                <AvatarFallback>{group.creator.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{group.creator.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                                        <p className="text-sm mt-1">{new Date(group.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Privacy</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {getPrivacyIcon()}
                                            <span className="text-sm">{getPrivacyText()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Members */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Members</CardTitle>
                                    <span className="text-sm text-muted-foreground">{group.members_count}</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {group.members.slice(0, 10).map((member) => (
                                            <div key={member.id} className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={member.user.avatar} />
                                                    <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm font-medium truncate">{member.user.name}</p>
                                                    {member.role !== "member" && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {member.role}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {group.members_count > 10 && (
                                            <p className="text-sm text-muted-foreground text-center pt-2">
                                                and {group.members_count - 10} more members
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
