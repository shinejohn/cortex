import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, useForm } from "@inertiajs/react";
import { Auth } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { route } from "ziggy-js";

interface LoyaltyProgram {
    id: string;
    name: string;
    description: string;
    points_per_dollar: number;
    is_active: boolean;
}

interface LoyaltyStats {
    total_enrollments: number;
    total_points_earned: number;
    total_points_redeemed: number;
    active_points: number;
}

interface LoyaltyIndexProps {
    auth: Auth;
    program?: LoyaltyProgram;
    stats?: LoyaltyStats;
}

export default function LoyaltyIndex({ auth, program, stats }: LoyaltyIndexProps) {
    const { data, setData, post, patch, processing, errors } = useForm({
        name: program?.name || "",
        description: program?.description || "",
        points_per_dollar: program?.points_per_dollar || 1,
        is_active: program?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (program) {
            patch(route('downtown-guide.dashboard.loyalty.update', program.id));
        } else {
            post(route('downtown-guide.dashboard.loyalty.store'));
        }
    };

    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Loyalty Program",
                description: "Manage your business loyalty program",
            }}
        >
            <Head title="Loyalty Program" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6 text-gray-900">
                                    <h2 className="text-xl font-semibold mb-6">Loyalty Program Settings</h2>

                                    <form onSubmit={submit} className="space-y-6">
                                        <div>
                                            <Label htmlFor="name">Program Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                placeholder="e.g., VIP Rewards"
                                                required
                                            />
                                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData("description", e.target.value)}
                                                rows={3}
                                                placeholder="Earn points with every purchase!"
                                                required
                                            />
                                            {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="points_per_dollar">Points per $1 Spent</Label>
                                                <Input
                                                    id="points_per_dollar"
                                                    type="number"
                                                    min="1"
                                                    value={data.points_per_dollar}
                                                    onChange={(e) => setData("points_per_dollar", parseInt(e.target.value))}
                                                    required
                                                />
                                                {errors.points_per_dollar && <div className="text-red-500 text-sm mt-1">{errors.points_per_dollar}</div>}
                                            </div>
                                            <div className="flex items-center space-x-2 pt-8">
                                                <Switch
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onCheckedChange={(checked) => setData("is_active", checked)}
                                                />
                                                <Label htmlFor="is_active">Program Active</Label>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={processing}>
                                                {program ? 'Update Program' : 'Create Program'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            {stats && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6 text-gray-900">
                                        <h3 className="text-lg font-semibold mb-4">Program Statistics</h3>
                                        <div className="space-y-4">
                                            <div className="border-b pb-2">
                                                <p className="text-sm text-gray-500">Total Members</p>
                                                <p className="text-2xl font-bold">{stats.total_enrollments}</p>
                                            </div>
                                            <div className="border-b pb-2">
                                                <p className="text-sm text-gray-500">Points Earned</p>
                                                <p className="text-2xl font-bold text-green-600">+{stats.total_points_earned}</p>
                                            </div>
                                            <div className="border-b pb-2">
                                                <p className="text-sm text-gray-500">Points Redeemed</p>
                                                <p className="text-2xl font-bold text-red-600">-{stats.total_points_redeemed}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Active Points Liability</p>
                                                <p className="text-2xl font-bold text-blue-600">{stats.active_points}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!program && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                    Create a loyalty program to start rewarding your customers and building retention.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
