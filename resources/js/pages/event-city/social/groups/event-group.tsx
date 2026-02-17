import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeftIcon,
    CalendarIcon,
    GlobeIcon,
    LockIcon,
    MapPinIcon,
    MessageSquareIcon,
    NavigationIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { LocationShareMap } from '@/components/event-city/location/LocationShareMap';
import { EventGroupActions } from '@/components/event-city/social/EventGroupActions';

interface GroupMember {
    id: string;
    user_id: string;
    role: 'admin' | 'moderator' | 'member';
    status: 'pending' | 'approved' | 'banned';
    joined_at: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
}

interface LocationShareData {
    id: string;
    latitude: number;
    longitude: number;
    user: {
        id: string;
        name: string;
    };
}

interface EventData {
    id: string;
    title: string;
    event_date: string;
    time?: string;
    category?: string;
    venue_info?: {
        name: string;
        city: string;
    };
}

interface Group {
    id: string;
    name: string;
    description: string;
    cover_image?: string;
    privacy: 'public' | 'private' | 'secret';
    creator_id: string;
    event_id?: string;
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
    event?: EventData;
}

interface Props {
    group: Group;
}

export default function EventGroup({ group }: Props) {
    const [locationShares, setLocationShares] = useState<LocationShareData[]>([]);
    const [isSharingLocation, setIsSharingLocation] = useState(false);
    const [activeShareId, setActiveShareId] = useState<string | null>(null);

    const isMember = group.user_membership?.status === 'approved';

    useEffect(() => {
        if (isMember) {
            fetchLocationShares();
            const interval = setInterval(fetchLocationShares, 30000);
            return () => clearInterval(interval);
        }
    }, [isMember]);

    const fetchLocationShares = async () => {
        try {
            const response = await axios.get(`/api/location-shares/group/${group.id}`);
            setLocationShares(response.data.shares || []);
        } catch {
            // Silently fail
        }
    };

    const toggleLocationSharing = async () => {
        if (isSharingLocation && activeShareId) {
            try {
                await axios.post(`/api/location-shares/${activeShareId}/stop`);
                setIsSharingLocation(false);
                setActiveShareId(null);
                toast.success('Location sharing stopped');
                fetchLocationShares();
            } catch {
                toast.error('Failed to stop sharing');
            }
            return;
        }

        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await axios.post('/api/location-shares', {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        event_id: group.event_id ?? null,
                        group_id: group.id,
                        duration_minutes: 120,
                    });
                    setIsSharingLocation(true);
                    setActiveShareId(response.data.share?.id ?? null);
                    toast.success('Location sharing started');
                    fetchLocationShares();
                } catch {
                    toast.error('Failed to start sharing');
                }
            },
            () => {
                toast.error('Unable to get your location');
            },
        );
    };

    const getPrivacyInfo = () => {
        switch (group.privacy) {
            case 'private':
                return { icon: <LockIcon className="h-4 w-4" />, label: 'Private' };
            case 'secret':
                return { icon: <UserIcon className="h-4 w-4" />, label: 'Secret' };
            default:
                return { icon: <GlobeIcon className="h-4 w-4" />, label: 'Public' };
        }
    };

    const privacy = getPrivacyInfo();

    return (
        <AppLayout>
            <Head title={`${group.name} - Event Group`} />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back button */}
                    <div className="mb-6">
                        <Link href="/social/groups">
                            <Button variant="ghost" size="sm">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Groups
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Main content */}
                        <div className="lg:w-2/3">
                            {/* Group header */}
                            <Card className="mb-6">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex-grow">
                                            <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    {privacy.icon}
                                                    {privacy.label}
                                                </Badge>
                                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <UsersIcon className="h-4 w-4" />
                                                    {group.members_count} members
                                                </span>
                                                {group.event && (
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        Event Group
                                                    </Badge>
                                                )}
                                            </div>
                                            {group.description && (
                                                <p className="mt-3 text-muted-foreground">{group.description}</p>
                                            )}
                                        </div>

                                        <EventGroupActions
                                            eventId={group.event_id ?? ''}
                                            eventTitle={group.event?.title ?? group.name}
                                            userGroupId={isMember ? group.id : null}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Event info */}
                            {group.event && (
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CalendarIcon className="h-5 w-5 text-primary" />
                                            Event Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">{group.event.title}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    {new Date(group.event.event_date).toLocaleDateString()}
                                                    {group.event.time && ` at ${group.event.time}`}
                                                </span>
                                                {group.event.venue_info && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPinIcon className="h-4 w-4" />
                                                        {group.event.venue_info.name}, {group.event.venue_info.city}
                                                    </span>
                                                )}
                                                {group.event.category && (
                                                    <Badge variant="secondary">{group.event.category}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Location sharing */}
                            {isMember && (
                                <div className="mb-6">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                                            <NavigationIcon className="h-5 w-5" />
                                            Location Sharing
                                        </h2>
                                        <Button
                                            variant={isSharingLocation ? 'destructive' : 'default'}
                                            size="sm"
                                            onClick={toggleLocationSharing}
                                        >
                                            <MapPinIcon className="mr-1 h-4 w-4" />
                                            {isSharingLocation ? 'Stop Sharing' : 'Share Location'}
                                        </Button>
                                    </div>
                                    <LocationShareMap locations={locationShares} />
                                </div>
                            )}

                            {/* Group chat placeholder */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <MessageSquareIcon className="h-5 w-5" />
                                        Group Chat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                                        <div className="text-center">
                                            <MessageSquareIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                            <p className="text-sm font-medium text-muted-foreground">Group chat coming soon</p>
                                            <p className="text-xs text-muted-foreground">
                                                Real-time messaging for event groups
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/3">
                            {/* Members */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Members</CardTitle>
                                    <span className="text-sm text-muted-foreground">{group.members_count}</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-96 space-y-3 overflow-y-auto">
                                        {group.members.slice(0, 15).map((member) => (
                                            <div key={member.id} className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={member.user.avatar} />
                                                    <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-grow">
                                                    <p className="truncate text-sm font-medium">{member.user.name}</p>
                                                    {member.role !== 'member' && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {member.role}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {group.members_count > 15 && (
                                            <p className="pt-2 text-center text-sm text-muted-foreground">
                                                and {group.members_count - 15} more members
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
