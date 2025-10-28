import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEditor } from "@/types/calendars";
import axios from "axios";
import { Plus, Trash2, UserCog } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface RoleManagementProps {
    calendarId: number;
    editors: CalendarEditor[];
    ownerId: number;
}

export function RoleManagement({ calendarId, editors, ownerId }: RoleManagementProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"editor" | "admin">("editor");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [localEditors, setLocalEditors] = useState<CalendarEditor[]>(editors);

    const handleAddEditor = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            // For now, users need to provide the user ID directly
            // In a production system, you would implement a user search API
            const userId = parseInt(email);

            if (isNaN(userId)) {
                setError("Please enter a valid user ID");
                setIsSubmitting(false);
                return;
            }

            // Now add the editor
            const response = await axios.post(route("calendars.editors.add", calendarId), {
                user_id: userId,
                role,
            });

            if (response.status === 200) {
                // Reload the page to show the new editor
                window.location.reload();
            }
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to add editor. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveEditor = async (userId: number) => {
        if (!confirm("Are you sure you want to remove this editor?")) {
            return;
        }

        try {
            await axios.delete(route("calendars.editors.remove", { calendar: calendarId, user: userId }));
            // Reload the page to reflect the change
            window.location.reload();
        } catch (err) {
            alert("Failed to remove editor. Please try again.");
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                        <UserCog className="h-5 w-5 text-gray-500 mr-2" />
                        Role Management
                    </CardTitle>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Editor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Editor</DialogTitle>
                                <DialogDescription>Add a new editor or admin to help manage this calendar</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddEditor} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">User ID</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="Enter user ID"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Enter the numeric user ID of the person you want to add</p>
                                </div>

                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={role} onValueChange={(value) => setRole(value as "editor" | "admin")}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Editors can add/remove events. Admins can also manage other editors.
                                    </p>
                                </div>

                                {error && <p className="text-sm text-destructive">{error}</p>}

                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Adding..." : "Add Editor"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {localEditors.length > 0 ? (
                        localEditors.map((editor) => (
                            <div key={editor.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(editor.user.name)}`}
                                            alt={editor.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{editor.user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{editor.role}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveEditor(editor.user_id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No editors added yet. Add editors to help manage this calendar.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
