import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, useForm } from "@inertiajs/react";
import { Auth } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Trophy, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Achievement {
    id: string;
    title: string;
    source_name: string;
    achievement_date: string;
    description?: string;
    source_url?: string;
    is_verified: boolean;
}

interface AchievementsIndexProps {
    auth: Auth;
    achievements: Achievement[];
    business: any;
}

export default function AchievementsIndex({ auth, achievements, business }: AchievementsIndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        title: "",
        source_name: "",
        achievement_date: "",
        description: "",
        source_url: "",
    });

    const openCreate = () => {
        setEditingAchievement(null);
        reset();
        clearErrors();
        setIsCreateOpen(true);
    };

    const openEdit = (achievement: Achievement) => {
        setEditingAchievement(achievement);
        setData({
            title: achievement.title,
            source_name: achievement.source_name,
            achievement_date: achievement.achievement_date ? achievement.achievement_date.split('T')[0] : "",
            description: achievement.description || "",
            source_url: achievement.source_url || "",
        });
        clearErrors();
        setIsCreateOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAchievement) {
            patch(route('downtown-guide.dashboard.achievements.update', editingAchievement.id), {
                onSuccess: () => setIsCreateOpen(false),
            });
        } else {
            post(route('downtown-guide.dashboard.achievements.store'), {
                onSuccess: () => setIsCreateOpen(false),
            });
        }
    };

    const handleDelete = (id: string) => {
        destroy(route('downtown-guide.dashboard.achievements.destroy', id));
    };

    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Achievements & Awards",
                description: "Manage your business awards and accolades",
            }}
        >
            <Head title="Achievements" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">Awards & Accolades</h2>
                                    <p className="text-sm text-gray-500">Showcase your business achievements on your profile.</p>
                                </div>
                                <Button onClick={openCreate}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Award
                                </Button>
                            </div>

                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>{editingAchievement ? 'Edit Award' : 'Add New Award'}</DialogTitle>
                                        <DialogDescription>
                                            Add details about an award or recognition your business has received.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={submit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Award Title</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData("title", e.target.value)}
                                                placeholder="e.g., Best Coffee Shop 2024"
                                                required
                                            />
                                            {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                                        </div>
                                        <div>
                                            <Label htmlFor="source_name">Awarded By</Label>
                                            <Input
                                                id="source_name"
                                                value={data.source_name}
                                                onChange={(e) => setData("source_name", e.target.value)}
                                                placeholder="e.g., City Weekly"
                                                required
                                            />
                                            {errors.source_name && <div className="text-red-500 text-sm mt-1">{errors.source_name}</div>}
                                        </div>
                                        <div>
                                            <Label htmlFor="achievement_date">Date Awarded</Label>
                                            <Input
                                                id="achievement_date"
                                                type="date"
                                                value={data.achievement_date}
                                                onChange={(e) => setData("achievement_date", e.target.value)}
                                                required
                                            />
                                            {errors.achievement_date && <div className="text-red-500 text-sm mt-1">{errors.achievement_date}</div>}
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData("description", e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="source_url">Link to Award (Optional)</Label>
                                            <Input
                                                id="source_url"
                                                value={data.source_url}
                                                onChange={(e) => setData("source_url", e.target.value)}
                                                placeholder="https://"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={processing}>
                                                {editingAchievement ? 'Save Changes' : 'Add Award'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {achievements.map((achievement) => (
                                    <div key={achievement.id} className="border rounded-lg p-4 flex flex-col relative bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                                    <Trophy className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                                                    <p className="text-sm text-gray-500">{achievement.source_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(achievement)}>
                                                    <Edit className="h-4 w-4 text-gray-500" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Award?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will remove this award from your business profile.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(achievement.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                                            <p>{achievement.description}</p>
                                            <p className="text-xs text-gray-400">Awarded: {format(new Date(achievement.achievement_date), 'MMMM d, yyyy')}</p>
                                            {achievement.source_url && (
                                                <a href={achievement.source_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underlined block mt-2">
                                                    View Source
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {achievements.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                                        <Trophy className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No awards yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by adding accolades your business has received.</p>
                                    <div className="mt-6">
                                        <Button onClick={openCreate}>Add First Award</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
