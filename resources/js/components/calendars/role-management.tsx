import { router } from "@inertiajs/react";
import axios from "axios";
import { Plus, Trash2, UserCog, Shield, Edit3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEditor } from "@/types/calendars";

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
    const [localEditors, _setLocalEditors] = useState<CalendarEditor[]>(editors);

    const handleAddEditor = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const userId = parseInt(email);

            if (isNaN(userId)) {
                setError("Please enter a valid user ID");
                setIsSubmitting(false);
                return;
            }

            const response = await axios.post(route("calendars.editors.add", calendarId), {
                user_id: userId,
                role,
            });

            if (response.status === 200) {
                toast.success("Editor added successfully");
                router.reload({ only: ["calendar"] });
            }
        } catch (err: unknown) {
            if (
                err &&
                typeof err === "object" &&
                "response" in err &&
                err.response &&
                typeof err.response === "object" &&
                "data" in err.response &&
                err.response.data &&
                typeof err.response.data === "object" &&
                "message" in err.response.data
            ) {
                setError(String(err.response.data.message));
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
            toast.success("Editor removed successfully");
            router.reload({ only: ["calendar"] });
        } catch (_err) {
            alert("Failed to remove editor. Please try again.");
        }
    };

    return (
        <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/30">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-display text-base font-black tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/30">
                            <UserCog className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Role Management
                    </CardTitle>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                <Plus className="h-4 w-4 mr-1.5" />
                                Add Editor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="font-display text-xl font-black tracking-tight">Add Editor</DialogTitle>
                                <DialogDescription>Add a new editor or admin to help manage this calendar</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddEditor} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">User ID</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="Enter user ID"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">Enter the numeric user ID of the person you want to add</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={role} onValueChange={(value) => setRole(value as "editor" | "admin")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="editor">
                                                <div className="flex items-center gap-2">
                                                    <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    Editor
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                                    Admin
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Editors can add/remove events. Admins can also manage other editors.
                                    </p>
                                </div>

                                {error && (
                                    <div className="rounded-lg bg-destructive/10 p-3">
                                        <p className="text-sm text-destructive">{error}</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {isSubmitting ? "Adding..." : "Add Editor"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-2">
                    {localEditors.length > 0 ? (
                        localEditors.map((editor) => (
                            <div
                                key={editor.id}
                                className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden ring-2 ring-background shadow-sm">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(editor.user.name)}&background=6366f1&color=fff`}
                                            alt={editor.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{editor.user.name}</p>
                                        <div className="flex items-center gap-1.5">
                                            {editor.role === "admin" ? (
                                                <Shield className="h-3 w-3 text-indigo-500" />
                                            ) : (
                                                <Edit3 className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            <p className="text-xs text-muted-foreground capitalize">{editor.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveEditor(editor.user_id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <UserCog className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No editors added yet</p>
                            <p className="mt-1 text-xs text-muted-foreground/70">Add editors to help manage this calendar.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
