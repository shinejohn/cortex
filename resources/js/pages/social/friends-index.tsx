import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { SearchIcon, FilterIcon, MessageCircleIcon, UsersIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Friend {
    id: string;
    name: string;
    username: string;
    avatar: string;
    location?: string;
    status: 'friend';
}

interface Props {
    friends: Friend[];
}

export default function FriendsIndex({ friends }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Friends" />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
                        <p className="text-gray-600">
                            Your friends on the platform ({friends.length} friends)
                        </p>
                    </div>

                    {/* Search and filter */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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

                    {/* Friends grid */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                All Friends ({filteredFriends.length})
                            </h2>
                        </div>

                        {filteredFriends.length > 0 ? (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFriends.map(friend => (
                                    <div key={friend.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <img
                                                src={friend.avatar}
                                                alt={friend.name}
                                                className="h-16 w-16 rounded-full object-cover"
                                            />
                                            <div className="ml-4 flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {friend.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">
                                                    @{friend.username}
                                                </p>
                                                {friend.location && (
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {friend.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex space-x-2">
                                            <Link
                                                href={`/social/profile/${friend.id}`}
                                                className="flex-1"
                                            >
                                                <Button variant="outline" size="sm" className="w-full">
                                                    View Profile
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/social/messages/${friend.id}`}
                                                className="flex-1"
                                            >
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
                                <SearchIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No friends found
                                </h3>
                                <p className="text-gray-500">
                                    No friends match your search query "{searchQuery}".
                                </p>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <UsersIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No friends yet
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Start connecting with people to build your network.
                                </p>
                                <Link href="/social">
                                    <Button>
                                        Explore Social Feed
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}