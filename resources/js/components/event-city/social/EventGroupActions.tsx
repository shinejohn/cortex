import { PlusIcon, LogOutIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventGroupActionsProps {
    eventId: string;
    eventTitle: string;
    userGroupId?: string | null;
    className?: string;
}

export function EventGroupActions({ eventId, eventTitle, userGroupId, className = '' }: EventGroupActionsProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        privacy: 'public',
    });

    const handleCreateGroup = async () => {
        setIsCreating(true);
        try {
            await axios.post(`/events/${eventId}/groups`, formData);
            toast.success('Group created successfully');
            setShowCreateDialog(false);
            setFormData({ name: '', description: '', privacy: 'public' });
            router.reload();
        } catch (error) {
            toast.error('Failed to create group');
        } finally {
            setIsCreating(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!userGroupId || !confirm('Are you sure you want to leave this group?')) {
            return;
        }

        try {
            await axios.delete(`/social/groups/${userGroupId}/leave`);
            toast.success('Left the group');
            router.reload();
        } catch (error) {
            toast.error('Failed to leave group');
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                <PlusIcon className="mr-1 h-4 w-4" />
                Create Group
            </Button>

            {userGroupId && (
                <Button variant="ghost" size="sm" onClick={handleLeaveGroup}>
                    <LogOutIcon className="mr-1 h-4 w-4" />
                    Leave Group
                </Button>
            )}

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UsersIcon className="h-5 w-5" />
                            Create Event Group
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Create a group for <span className="font-medium">{eventTitle}</span>
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="group-name">Group Name</Label>
                            <Input
                                id="group-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., VIP Section Meetup"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="group-description">Description (optional)</Label>
                            <Textarea
                                id="group-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What is this group about?"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="group-privacy">Privacy</Label>
                            <select
                                id="group-privacy"
                                value={formData.privacy}
                                onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="public">Public - Anyone can join</option>
                                <option value="private">Private - Requires approval</option>
                                <option value="secret">Secret - Invite only</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateGroup} disabled={isCreating || !formData.name.trim()}>
                                {isCreating ? 'Creating...' : 'Create Group'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
