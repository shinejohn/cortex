import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ChevronDownIcon, FilterIcon, GlobeIcon, LockIcon, PlusIcon, SearchIcon, UserIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GridCard } from "@/components/common/grid-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";

interface Group {
    id: string;
    name: string;
    description: string;
    cover_image?: string;
    members_count: number;
    privacy: "public" | "private" | "secret";
    joined?: boolean;
    creator: {
        name: string;
        avatar?: string;
    };
    last_activity?: string;
    href: string;
}

interface Props {
    my_groups: Group[];
    suggested_groups: Group[];
}

const groupCategories = [
    "All Categories",
    "Music",
    "Local Events",
    "Food & Drink",
    "Arts & Culture",
    "Professional",
    "Sports",
    "Technology",
    "Photography",
    "Outdoors",
    "Family",
    "Education",
    "Health & Wellness",
];

export default function GroupsIndex({ my_groups, suggested_groups }: Props) {
    const [activeTab, setActiveTab] = useState("my-groups");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    const handleJoinGroup = async (groupId: string) => {
        try {
            await axios.post(`/social/groups/${groupId}/join`);
            toast.success("Successfully joined group");
            router.reload({ only: ["groups"] });
        } catch (error) {
            console.error("Error joining group:", error);
        }
    };

    const handleLeaveGroup = async (groupId: string) => {
        if (confirm("Are you sure you want to leave this group?")) {
            try {
                await axios.delete(`/social/groups/${groupId}/leave`);
                toast.success("Successfully left group");
                router.reload({ only: ["groups"] });
            } catch (error) {
                console.error("Error leaving group:", error);
            }
        }
    };

    const filteredMyGroups = my_groups.filter((group) => {
        const matchesSearch =
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) || group.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const filteredSuggestedGroups = suggested_groups.filter((group) => {
        const matchesSearch =
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) || group.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <AppLayout>
            <Head title="Groups" />
            <div className="min-h-screen bg-muted/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-display font-black tracking-tight text-foreground">Groups</h1>
                        <p className="text-muted-foreground">Connect with people who share your interests</p>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left sidebar */}
                        <div className="md:w-1/4">
                            <div className="bg-card rounded-lg shadow-sm mb-6">
                                <div className="p-4">
                                    <Link
                                        href="/social/groups/create"
                                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Create New Group
                                    </Link>
                                </div>
                                <div className="border-t">
                                    <nav className="p-2">
                                        <button
                                            onClick={() => setActiveTab("my-groups")}
                                            className={`flex items-center w-full px-3 py-2 text-left rounded-md transition-colors ${
                                                activeTab === "my-groups" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                                            }`}
                                        >
                                            <UsersIcon className="h-5 w-5 mr-3" />
                                            <span className="font-medium">My Groups</span>
                                            <span className="ml-auto bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                                                {my_groups.length}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("discover")}
                                            className={`flex items-center w-full px-3 py-2 text-left rounded-md transition-colors ${
                                                activeTab === "discover" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                                            }`}
                                        >
                                            <GlobeIcon className="h-5 w-5 mr-3" />
                                            <span className="font-medium">Discover Groups</span>
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Categories filter */}
                            <div className="bg-card rounded-lg shadow-sm">
                                <div className="p-4 border-b">
                                    <h3 className="font-medium text-foreground">Categories</h3>
                                </div>
                                <div className="p-4 max-h-80 overflow-y-auto">
                                    <div className="space-y-2">
                                        {groupCategories.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`flex items-center w-full px-3 py-2 text-left rounded-md transition-colors ${
                                                    selectedCategory === category
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-foreground hover:bg-muted/50"
                                                }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main content area */}
                        <div className="md:w-3/4">
                            {/* Search and filter */}
                            <div className="bg-card rounded-lg shadow-sm mb-6 p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-grow">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search groups"
                                            className="pl-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline">
                                            <FilterIcon className="h-4 w-4 mr-2" />
                                            Filter
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Groups content based on active tab */}
                            {activeTab === "my-groups" && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">My Groups</h2>
                                    {filteredMyGroups.length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {filteredMyGroups.map((group) => (
                                                <GridCard
                                                    key={group.id}
                                                    id={group.id}
                                                    href={group.href}
                                                    image={
                                                        group.cover_image ||
                                                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                                    }
                                                    imageAlt={group.name}
                                                    badge={group.privacy === "private" ? "Private" : "Public"}
                                                    title={group.name}
                                                    actions={
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleLeaveGroup(group.id);
                                                            }}
                                                        >
                                                            Leave
                                                        </Button>
                                                    }
                                                    imageOverlay={
                                                        <div className="absolute top-2 right-2">
                                                            {group.privacy === "private" ? (
                                                                <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                    <LockIcon className="h-3 w-3 mr-1" />
                                                                    Private
                                                                </span>
                                                            ) : group.privacy === "secret" ? (
                                                                <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                    <UserIcon className="h-3 w-3 mr-1" />
                                                                    Secret
                                                                </span>
                                                            ) : (
                                                                <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                    <GlobeIcon className="h-3 w-3 mr-1" />
                                                                    Public
                                                                </span>
                                                            )}
                                                        </div>
                                                    }
                                                >
                                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{group.description}</p>
                                                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                                                        <div className="flex items-center mr-4">
                                                            <UsersIcon className="h-4 w-4 mr-1" />
                                                            {group.members_count.toLocaleString()} members
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{group.last_activity || "Active recently"}</div>
                                                </GridCard>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-card rounded-lg shadow-sm p-8 text-center">
                                            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                                            <h3 className="mt-2 text-lg font-medium text-foreground">No groups found</h3>
                                            <p className="mt-1 text-muted-foreground">You haven't joined any groups yet or none match your search.</p>
                                            <div className="mt-6">
                                                <Button onClick={() => setActiveTab("discover")}>Discover Groups</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "discover" && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Discover Groups</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {filteredSuggestedGroups.map((group) => (
                                            <GridCard
                                                key={group.id}
                                                id={group.id}
                                                href={group.href}
                                                image={
                                                    group.cover_image ||
                                                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                                }
                                                imageAlt={group.name}
                                                badge={group.privacy === "private" ? "Private" : group.privacy === "secret" ? "Secret" : "Public"}
                                                title={group.name}
                                                actions={
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleJoinGroup(group.id);
                                                        }}
                                                    >
                                                        Join
                                                    </Button>
                                                }
                                                imageOverlay={
                                                    <div className="absolute top-2 right-2">
                                                        {group.privacy === "private" ? (
                                                            <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                <LockIcon className="h-3 w-3 mr-1" />
                                                                Private
                                                            </span>
                                                        ) : group.privacy === "secret" ? (
                                                            <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                <UserIcon className="h-3 w-3 mr-1" />
                                                                Secret
                                                            </span>
                                                        ) : (
                                                            <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                <GlobeIcon className="h-3 w-3 mr-1" />
                                                                Public
                                                            </span>
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{group.description}</p>
                                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                                    <div className="flex items-center mr-4">
                                                        <UsersIcon className="h-4 w-4 mr-1" />
                                                        {group.members_count.toLocaleString()} members
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">Created by {group.creator.name}</div>
                                            </GridCard>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
